


# MHS Chart Backend Python

## Run App in Windows
set FLASK_CONFIG='config.DevelopmentConfig'

python app.py


set FLASK_CONFIG='config.TestingConfig'

python app.py

set FLASK_CONFIG='config.ProductionConfig'

python app.py

## Run App in Linux
export FLASK_CONFIG='config.DevelopmentConfig'
python app.py

export FLASK_CONFIG='config.TestingConfig'
python app.py

export FLASK_CONFIG='config.ProductionConfig'
python app.py


## Run App in Linux using WSGI server
pip install gunicorn

gunicorn -w 4 -b 0.0.0.0:5000 run:app

-w 4: Specifies the number of worker processes. Adjust this based on your server's CPU cores.

## MySQL Docker
docker run --name mysql-container -p 3306:3306 -h adi.dev.modernisc.com -e MYSQL_ROOT_PASSWORD=mysql -v /home/abis/mySql/data:/var/lib/mysql -d mysql:latest
