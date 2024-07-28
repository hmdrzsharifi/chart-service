


# MHS Chart Backend Python

## Linux Requirements
pip install gunicorn

## Run in Linux environment
gunicorn -w 4 -b 0.0.0.0:5000 run:app

-w 4: Specifies the number of worker processes. Adjust this based on your server's CPU cores.

## MySQL Docker
docker run --name mysql-container -p 3306:3306 -h adi.dev.modernisc.com -e MYSQL_ROOT_PASSWORD=mysql -v /home/abis/mySql/data:/var/lib/mysql -d mysql:latest
