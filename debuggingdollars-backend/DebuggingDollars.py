from flask import Flask, jsonify, request, make_response, session #importing flask, jsonify, request, make_response
import requests     #importing requests to make http requests and get data from the web
from flask_cors import CORS #importing flask_cors to enable cross-origin resource sharing
import oracledb #importing oracledb to connect to the Oracle database
import hashlib #importing hashlib to hash the password

# Oracle database connection details
un = 'ADMIN'
cs = '(description= (retry_count=20)(retry_delay=3)(address=(protocol=tcps)(port=1522)(host=adb.eu-madrid-1.oraclecloud.com))(connect_data=(service_name=g023613c63a0206_capstonedatabase_high.adb.oraclecloud.com))(security=(ssl_server_dn_match=yes)))'
pw = 'CapstoneDatabase12345'
# Establish a connection to the Oracle database
connection = oracledb.connect(user=un, password=pw, dsn=cs)

app = Flask(__name__)   # initializing the flask app
app.secret_key = "debugging_dollars"  # setting the secret key for the app
app.config['SESSION_COOKIE_SAMESITE'] = 'None' # setting the session cookie samesite to None
app.config['SESSION_COOKIE_SECURE'] = True # setting the session cookie secure to True
CORS(app, supports_credentials= True, resources= {r"/*":{"origins":"*"}})   # enabling cross-origin resource sharing for the app

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
    # Fetch the username from the session
    userID = session.get('userID')
    if not userID:
        # If the username is not found in the session, return an error
        return jsonify({'error': 'User not logged in'}), 401
        
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

    return jsonify({'total_value': round((total_value), 2),'symbols': portfolio_data}), 200 # Return the total portfolio value and individual stock values



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
    userID = session.get('userID')
    if not userID:
        # If the username is not found in the session, return an error
        return jsonify({'error': 'User not logged in'}), 401
    stocksymbol = data.get('stocksymbol')
    quantity = data.get('quantity')
    action = data.get('action')  # 'add' or 'remove'

    with connection.cursor() as cursor:
        if action == 'add':
            # Check if the stock already exists in the user's portfolio database
            cursor.execute("SELECT QUANTITY FROM user_stocks WHERE USERID = :userid AND STOCKSYMBOL = :stocksymbol", userid=userID, stocksymbol=stocksymbol)
            result = cursor.fetchone()

            if result:
                # Update quantity if stock exists in the database
                new_quantity = result[0] + quantity
                cursor.execute("UPDATE user_stocks SET QUANTITY = :new_quantity WHERE USERID = :userid AND STOCKSYMBOL = :stocksymbol", new_quantity=new_quantity, userid=userID, stocksymbol=stocksymbol)
            else:
                # Insert new stock into the portfolio in the database
                cursor.execute("INSERT INTO user_stocks (USERID, STOCKSYMBOL, QUANTITY) VALUES (:userid, :stocksymbol, :quantity)", userid=userID, stocksymbol=stocksymbol, quantity=quantity)

        elif action == 'remove':
            # Check if the stock exists and the quantity is sufficient in the database
            cursor.execute("SELECT QUANTITY FROM user_stocks WHERE USERID = :userid AND STOCKSYMBOL = :stocksymbol", userid=userID, stocksymbol=stocksymbol)
            result = cursor.fetchone()

            if result and result[0] >= quantity:
                # If quantity is equal to what's in the portfolio, remove the stock entry from the database
                if result[0] == quantity:
                    cursor.execute("DELETE FROM user_stocks WHERE USERID = :userid AND STOCKSYMBOL = :stocksymbol", userid=userID, stocksymbol=stocksymbol)
                else:
                    # Update quantity if stock exists and removing part of it in the database
                    new_quantity = result[0] - quantity
                    cursor.execute("UPDATE user_stocks SET QUANTITY = :new_quantity WHERE USERID = :userid AND STOCKSYMBOL = :stocksymbol", new_quantity=new_quantity, userid=userID, stocksymbol=stocksymbol)
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


def hash_value(string):
    hash = hashlib.sha1()
    hash.update(string.encode())
    return hash.hexdigest()

#login route to autheticate the user
@app.route('/login', methods=['POST'])

#check authetication for username and password from users table in oracle database
def login():
    data = request.get_json()
    
    # Check for required data first
    if "username" not in data or "password" not in data:
        return make_response(jsonify({'error': 'Username and password are required'}), 400)
    
    username = data['username']
    password = hash_value(data['password'])  # Ensure this is secure hashing
    
    with connection.cursor() as cursor:
        # Correct parameter passing method depends on your database connector
        cursor.execute("SELECT userID, username FROM users WHERE USERNAME = :username AND PASSWORD = :password", (username, password))
        user = cursor.fetchone()
        
        if user:
            session.modified = True
            session.permanent = True
            session['userID'] = user[0]  # Set the session with the actual username
            return jsonify({"userID": session["userID"], "logged_in": True}), 200
        else:
            return make_response(jsonify({'error': 'Invalid username or password'}), 401)

#check if user stil logged in
@app.route('/checklogin', methods=['GET'])
#check if the user is logged in by checking if the username is in the session
def check_login():
    if "userid" in session:
        userID = session["userID"]
        return jsonify({"userID": userID, "logged_in": True}), 200
    else:
        return jsonify({"message": "not logged in, OR NO COOKIE BEING ATTACHED"}), 400
    
#logout route to logout the user
@app.route('/logout', methods=['POST'])
# if the user in the session when logging out, it removes the user from the session and returns a message
def logout():
    if "userID" in session: 
        session.pop("userID")
        return jsonify({"message": "Logged out successfully"}), 200

#register route to register the user    
@app.route('/register', methods=['POST'])
# this serves for as registration as it checks if the username already exists in the database and if not, it registers the user (username is unique)
def register():
    data = request.get_json()
    
    # Check for required data first
    if "username" not in data or "password" not in data:
        return make_response(jsonify({'error': 'Username and password are required'}), 400)
    
    username = data['username']
    password = hash_value(data['password'])  # Assuming hash_value is a function you've defined elsewhere

    try:
        with connection.cursor() as cursor:
            # First, check if the username already exists
            cursor.execute("""
                SELECT COUNT(*) FROM users WHERE username = :username
            """, [username])
            result = cursor.fetchone()
            if result[0] > 0:
                # If the count is greater than 0, the username exists and return an error response 
                return jsonify({'error': 'Username already exists, please choose another'}), 400

            # Username does not exist, proceed with registration
            cursor.execute("""
                INSERT INTO users (username, password)
                VALUES (:username, :password)
            """, [username, password])
        connection.commit()
        return jsonify({'message': 'User registered successfully'}), 201
    
    except oracledb.DatabaseError as e:
        # Simple error handling, you might want to log the error or handle specific exceptions
        return jsonify({'error': 'Database error occurred'}), 500

# Route to fetch the top gainers from the Alpha Vantage API
@app.route('/api/market-data')
# This route fetches the top gainers from the Alpha Vantage API and returns the data in a simplified format
def get_market_data():
    api_url = "https://www.alphavantage.co/query"
    api_key = "QLWHWRGDCN87D8TT"
    params = {
        "function": "TOP_GAINERS_LOSERS",
        "apikey": api_key
    }
    response = requests.get(api_url, params=params)
    if response.status_code == 200:
        data = response.json()

        # Extracting data from the response
        top_gainers = data.get('top_gainers', [])

        # Simplify data to contain only necessary information
        simplified_data = []
        for gainer in top_gainers:
            simplified_gainer = {
                "ticker": gainer["ticker"],
                "price": gainer["price"],
                "change_amount": gainer["change_amount"],
                "change_percentage": gainer["change_percentage"]
            }
            simplified_data.append(simplified_gainer)

        return jsonify(simplified_data)
    else:
        return jsonify({"error": "Failed to fetch market data"}), response.status_code


if __name__ == '__main__':
    app.run(debug=False) ## Run the Flask application