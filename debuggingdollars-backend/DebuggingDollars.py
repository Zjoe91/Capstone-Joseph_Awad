from flask import Flask, jsonify, request, make_response #importing flask, jsonify, request, make_response
import requests     #importing requests to make http requests and get data from the web
from flask_cors import CORS #importing flask_cors to enable cross-origin resource sharing
import oracledb #importing oracledb to connect to the Oracle database

# Oracle database connection details
un = 'ADMIN'
cs = '(description= (retry_count=20)(retry_delay=3)(address=(protocol=tcps)(port=1522)(host=adb.eu-madrid-1.oraclecloud.com))(connect_data=(service_name=g023613c63a0206_capstonedatabase_high.adb.oraclecloud.com))(security=(ssl_server_dn_match=yes)))'
pw = 'CapstoneDatabase12345'
# Establish a connection to the Oracle database
connection = oracledb.connect(user=un, password=pw, dsn=cs)

app = Flask(__name__)   # initializing the flask app
CORS(app)   # enabling cross-origin resource sharing for the app

# Index route for the homepage
# This route returns a welcome message when accessed
@app.route('/')
def index():
    return "Welcome to DebuggingDollars - Your Personal Stock Tracker!"

# Route to get user portfolio
# This route accepts a username parameter and returns the stock portfolio for that user
@app.route('/overview', methods=['GET'])

# It returns the user's stock portfolio, including the current value of each stock and the total portfolio value.
# The portfolio value is calculated by fetching real-time stock prices from an external API.
def get_portfolio():
    # UserID hardcoded for this milestone
    userID= 1
    # Make a database query to get the user's stock portfolio
    sql_query= "SELECT STOCKSYMBOL, QUANTITY FROM user_stocks WHERE USERID = :userID"
    # Execute the query and fetch the user's stock portfolio
    with connection.cursor() as cursor:
        cursor.execute(sql_query, userID=userID)
        user_portfolio = cursor.fetchall()
    
    total_value = 0 # Total value of the portfolio
    portfolio_data = {} #initialize response dictionary for portfolio data

    # Iterate over each stock in the user's portfolio
    for symbol, quantity in user_portfolio:
        # Make an API request to get current stock price for each symbol using function GLOBAL_QUOTE to get real-time stock data
        stock_data_response = requests.get("https://www.alphavantage.co/query", params={
            'function': 'GLOBAL_QUOTE',
            'symbol': symbol,
            'apikey': 'QLWHWRGDCN87D8TT'
        })
        if stock_data_response.status_code != 200:
            # If the API request fails, return an error response
            return jsonify({'error': 'Failed to fetch stock data'}), stock_data_response.status_code

        stock_data = stock_data_response.json()
        if 'Error Message' in stock_data:
            # If the stock symbol is invalid or not found, return an error response
            return jsonify({'error': 'Invalid or unrecognized stock symbol'}), 404
        
        # Extract the stock price from the API response and calculate the total value of the stock holding
        stock_data = stock_data['Global Quote']
        price = float(stock_data['05. price']) # Current stock price
        total_value += round((price * quantity),2) # Calculate the total value of the stock holding
        portfolio_data[symbol] = {
            'quantity': quantity,
            'value': round((price * quantity),2)
        }

    return jsonify({'total_value': total_value,'symbols': portfolio_data}), 200 # Return the total portfolio value and individual stock values



# Route to get stock data from Alpha Vantage, it accepts a stock symbol as a parameter and returns the stock's daily data including opening, closing, high, low prices, and volume.
@app.route('/stockinfo/<symbol>', methods=['GET'])

# Given a stock symbol as a parameter, it retrieves the stock's daily data including opening, closing, high, low prices, and volume.
# This method is essential for users wanting to analyze individual stock performance for the last 5 days
def get_stock_data(symbol):
    
    try:
        # Make an API request to get daily stock data for the given symbol using function TIME_SERIES_DAILY to get daily stock data
        daily_data_response = requests.get("https://www.alphavantage.co/query", params={
            'function': 'TIME_SERIES_DAILY',
            'symbol': symbol,
            'apikey': 'QLWHWRGDCN87D8TT',
            'outputsize': 'compact'
        })
        if daily_data_response.status_code != 200:
            # If the API request fails, return an error response
            return jsonify({'error': 'Failed to fetch daily stock data'}), daily_data_response.status_code

        daily_data = daily_data_response.json()
        if 'Error Message' in daily_data:
            # If the stock symbol is invalid or not found, return an error response
            return jsonify({'error': 'Invalid or unrecognized stock symbol'}), 404


    except requests.exceptions.RequestException as e:
        # If an error occurs during the API request, return an error response
        return jsonify({'error': 'An error occurred while fetching stock data'}), 500

    daily_data = daily_data_response.json()

    # Process daily data
    daily_timeseries = daily_data.get('Time Series (Daily)', {})
    daily_result = []
    for date, values in list(daily_timeseries.items())[:5]:  # Get the latest 5 days of stock data
        daily_result.append([
            date,
            {'1. open': round(float(values['1. open']), 2),
            '2. high': round(float(values['2. high']), 2),
            '3. low': round(float(values['3. low']), 2),
            '4. close': round(float(values['4. close']), 2),
            '5. volume': int(values['5. volume']),
            }
        ])



    return jsonify(daily_result), 200 # Return the stock symbol and daily stock data for the last 5 days

# this route is used to modify the user's portfolio by adding or removing stocks
@app.route('/modifyPortfolio', methods=['POST'])

# This route accepts a JSON payload with the stock symbol, quantity, and action (add or remove) to modify the user's portfolio in oracle database
def modify_portfolio():
    data = request.json
    userid = 1
    stocksymbol = data.get('stocksymbol')
    quantity = data.get('quantity')
    action = data.get('action')  # 'add' or 'remove'

    with connection.cursor() as cursor:
        if action == 'add':
            # Check if the stock already exists in the user's portfolio
            cursor.execute("SELECT QUANTITY FROM user_stocks WHERE USERID = :userid AND STOCKSYMBOL = :stocksymbol", userid=userid, stocksymbol=stocksymbol)
            result = cursor.fetchone()

            if result:
                # Update quantity if stock exists
                new_quantity = result[0] + quantity
                cursor.execute("UPDATE user_stocks SET QUANTITY = :new_quantity WHERE USERID = :userid AND STOCKSYMBOL = :stocksymbol", new_quantity=new_quantity, userid=userid, stocksymbol=stocksymbol)
            else:
                # Insert new stock into the portfolio
                cursor.execute("INSERT INTO user_stocks (USERID, STOCKSYMBOL, QUANTITY) VALUES (:userid, :stocksymbol, :quantity)", userid=userid, stocksymbol=stocksymbol, quantity=quantity)

        elif action == 'remove':
            # Check if the stock exists and the quantity is sufficient
            cursor.execute("SELECT QUANTITY FROM user_stocks WHERE USERID = :userid AND STOCKSYMBOL = :stocksymbol", userid=userid, stocksymbol=stocksymbol)
            result = cursor.fetchone()

            if result and result[0] >= quantity:
                # If quantity is equal to what's in the portfolio, remove the stock entry
                if result[0] == quantity:
                    cursor.execute("DELETE FROM user_stocks WHERE USERID = :userid AND STOCKSYMBOL = :stocksymbol", userid=userid, stocksymbol=stocksymbol)
                else:
                    # Update quantity if stock exists and selling part of it
                    new_quantity = result[0] - quantity
                    cursor.execute("UPDATE user_stocks SET QUANTITY = :new_quantity WHERE USERID = :userid AND STOCKSYMBOL = :stocksymbol", new_quantity=new_quantity, userid=userid, stocksymbol=stocksymbol)
            else:
                # Stock does not exist or insufficient quantity
                return jsonify({'error': 'Insufficient stock quantity or stock does not exist'}), 400

        # Commit the changes to the database
        connection.commit()

    return jsonify({'message': 'Portfolio updated successfully.'}), 200

# Route to search for stock symbols using a query string
@app.route('/api/searchTickers')
# This route accepts a query parameter and returns a list of stock symbols and their names that match the query
def search_tickers():
    query = request.args.get('query')
    if not query:
        return jsonify([])

    # Alpha Vantage API endpoint for symbol search
    url = "https://www.alphavantage.co/query"
    params = {
        "function": "SYMBOL_SEARCH",
        "keywords": query,
        "apikey": "QLWHWRGDCN87D8TT"
    }

    response = requests.get(url, params=params)
    if response.status_code == 200:
        data = response.json()
        # extract and send symbol and name
        results = [{"symbol": item["1. symbol"], "name": item["2. name"]} for item in data.get("bestMatches", [])]
        return jsonify(results)
    else:
        return jsonify({"error": "Failed to fetch data from Alpha Vantage"}), response.status_code


if __name__ == '__main__':
    app.run(debug=False) ## Run the Flask application