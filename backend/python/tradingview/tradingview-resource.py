from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import time
import json

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+mysqlconnector://db_user:db_user_pass@adi.dev.modernisc.com/app_db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)


class Chart(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    ownerSource = db.Column(db.String(255), nullable=False)
    ownerId = db.Column(db.String(255), nullable=False)
    name = db.Column(db.String(255), nullable=False)
    content = db.Column(db.Text, nullable=False)
    lastModified = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    symbol = db.Column(db.String(255), nullable=False)
    resolution = db.Column(db.String(255), nullable=False)


db.create_all()


def common_response(data):
    return jsonify(data)


def common_error(message):
    return jsonify({'status': 'error', 'message': message}), 400


def parseRequest(request):
    # This is a placeholder. Implement your request parsing logic here.
    return {'error': None, 'response': None, 'clientId': 'someClientId', 'userId': 'someUserId'}


@app.route('/processRequest', methods=['GET', 'POST', 'DELETE'])
def process_request():
    # parsed_request = parseRequest(request)

    # if parsed_request['error'] is not None:
    #     return parsed_request['error']
    #
    # if parsed_request['response'] is not None:
    #     return parsed_request['response']

    # clientId = parsed_request["clientId"]
    # userId = parsed_request['userId']
    # chartId = request.args.get('chart', '')

    request_data = request.json
    clientId = request_data.get('clientId')
    userId = request_data.get('userId')
    chartId = request_data.get('chart')


    if request.method == 'GET':
        if chartId == '':
            return get_all_user_charts(clientId, userId)
        else:
            return get_chart_content(clientId, userId, chartId)

    elif request.method == 'DELETE':
        if chartId == '':
            return common_error('Wrong chart id')
        else:
            return remove_chart(clientId, userId, chartId)

    elif request.method == 'POST':
        chartName = request.form.get('name')
        symbol = request.form.get('symbol')
        resolution = request.form.get('resolution')
        content = request.form.get('content')
        if chartId == '':
            return save_chart(clientId, userId, chartName, symbol, resolution, content)
        else:
            return rewrite_chart(clientId, userId, chartId, chartName, symbol, resolution, content)

    else:
        return common_error('Wrong request')


def get_all_user_charts(clientId, userId):
    charts_list = Chart.query.filter_by(ownerSource=clientId, ownerId=userId).all()
    result = [{'id': chart.id, 'name': chart.name, 'timestamp': time.mktime(chart.lastModified.timetuple()),
               'symbol': chart.symbol, 'resolution': chart.resolution} for chart in charts_list]
    return common_response({'status': "ok", 'data': result})


def get_chart_content(clientId, userId, chartId):
    chart = Chart.query.filter_by(ownerSource=clientId, ownerId=userId, id=chartId).first()
    if chart:
        result = {'status': 'ok',
                  'data': {'id': chart.id, 'name': chart.name, 'timestamp': time.mktime(chart.lastModified.timetuple()),
                           'content': chart.content}}
        return common_response(result)
    else:
        return common_error('Chart not found')


def remove_chart(clientId, userId, chartId):
    chart = Chart.query.filter_by(ownerSource=clientId, ownerId=userId, id=chartId).first()
    if chart:
        db.session.delete(chart)
        db.session.commit()
        return common_response({'status': 'ok'})
    else:
        return common_error('Chart not found')


def save_chart(clientId, userId, chartName, symbol, resolution, content):
    new_chart = Chart(
        ownerSource=clientId,
        ownerId=userId,
        name=chartName,
        content=content,
        lastModified=datetime.utcnow(),
        symbol=symbol,
        resolution=resolution
    )
    db.session.add(new_chart)
    db.session.commit()
    return common_response({'status': 'ok', 'id': new_chart.id})


def rewrite_chart(clientId, userId, chartId, chartName, symbol, resolution, content):
    chart = Chart.query.filter_by(ownerSource=clientId, ownerId=userId, id=chartId).first()
    if chart:
        chart.lastModified = datetime.utcnow()
        chart.content = content
        chart.name = chartName
        chart.symbol = symbol
        chart.resolution = resolution

        db.session.commit()
        return common_response({'status': 'ok'})
    else:
        return common_error('Chart not found')


if __name__ == '__main__':
    app.run(debug=True)
