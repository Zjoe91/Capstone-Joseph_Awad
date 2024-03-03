from flask import Flask, jsonify, request, make_response #importing flask, jsonify, request, make_response
import requests     #importing requests to make http requests and get data from the web

app = Flask(__name__)   # initializing the flask app

# Mock database of user portfolios
# This is a simple in-memory structure to simulate user stock portfolios
user_databse = {
    'user1': {'AAPL': 10, 'GOOGL': 5, 'AMZN': 3},   
}


# Index route for the homepage
# This route returns a welcome message when accessed
@app.route('/')
def index():
    return "Welcome to DebuggingDollars - Your Personal Stock Tracker!"

# Route to get user portfolio
# This route accepts a username parameter and returns the stock portfolio for that user
@app.route('/portfolioinfo/<username>', methods=['GET'])

# It accepts a username as a parameter and returns the user's stock portfolio, including the current value of each stock and the total portfolio value.
# The portfolio value is calculated by fetching real-time stock prices from an external API.
def get_portfolio(username):
    # Check if the username exists in the mock database
    if username not in user_databse:
        return jsonify({'error': 'User not found'}), 404

    users_portfolio_data = user_databse[username]
    total_value = 0 # Total value of the portfolio
    portfolio_data = {} #initialize response dictionary for portfolio data

    # Iterate over each stock in the user's portfolio
    for symbol, quantity in users_portfolio_data.items():
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
        total_value += price * quantity
        portfolio_data[symbol] = {
            'quantity': quantity,
            'value': price * quantity
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
            {'open': round(float(values['1. open']), 2),
            'high': round(float(values['2. high']), 2),
            'low': round(float(values['3. low']), 2),
            'close': round(float(values['4. close']), 2),
            'volume': values['5. volume'],
            }
        ])



    return jsonify(daily_result), 200 # Return the stock symbol and daily stock data for the last 5 days

if __name__ == '__main__':
    app.run(debug=True) ## Run the Flask application