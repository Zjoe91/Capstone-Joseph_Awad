from flask import Flask, jsonify, request, make_response
import requests

app = Flask(__name__)

# Mock database of user portfolios
users_portfolio = {
    'user1': {'AAPL': 10, 'GOOGL': 5, 'MSFT': 15},   
}


# Index route for the homepage
@app.route('/')
def index():
    return "Welcome to DebuggingDollars - Your Personal Stock Tracker!"

# Route to get user portfolio
@app.route('/portfolio/<username>', methods=['GET'])

def get_portfolio(username):
    portfolio = users_portfolio.get(username, [])
    if not portfolio:
        return make_response(jsonify({'error': 'User not found'}), 404)
    return jsonify({'Portfolio stocks': portfolio}), 200

# Route to get stock data from Alpha Vantage
@app.route('/stockinfo/<symbol>', methods=['GET'])

def get_stock_data(symbol):
    
    try:
        daily_data_response = requests.get("https://www.alphavantage.co/query", params={
            'function': 'TIME_SERIES_DAILY',
            'symbol': symbol,
            'apikey': 'QLWHWRGDCN87D8TT',
            'outputsize': 'compact'
        })
        if daily_data_response.status_code != 200:
            return jsonify({'error': 'Failed to fetch daily stock data'}), daily_data_response.status_code

        daily_data = daily_data_response.json()
        if 'Error Message' in daily_data:
            return jsonify({'error': 'Invalid or unrecognized stock symbol'}), 404


    except requests.exceptions.RequestException as e:
        return jsonify({'error': 'An error occurred while fetching stock data'}), 500

    daily_data = daily_data_response.json()

    # Process daily data
    daily_timeseries = daily_data.get('Time Series (Daily)', {})
    daily_result = []
    for date, values in list(daily_timeseries.items())[:5]:  #daily value
        daily_result.append({
            'date': date,
            'open': values['1. open'],
            'high': values['2. high'],
            'low': values['3. low'],
            'close': values['4. close'],
            'volume': values['5. volume'],
        })



    return jsonify({'symbol': symbol, 'daily_data': daily_result}), 200

if __name__ == '__main__':
    app.run(debug=True)