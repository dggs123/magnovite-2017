# Magnovite 2017
Magnovite is a annual tech fest organized by Christ University.
<a href="https://magnovitev6.herokuapp.com" > Demo </a>
# Setup and running
Clone the repo and cd to the folder
```
$ git clone https://github.com/dggs123/magnovite-2017
$ cd magnovite-2017
```
Install and setup pip and Virtualenv. This may take sometime depending on your internet speed.
```
$ sudo apt-get install python-pip
$ pip install virtualenv
```
Commands to run server
```
$ virtualenv .
$ pip install -r requirements.txt
# This may take few minutes, go get some coffee until then

$ python manage.py runserver
```
Now the website should be available on localhost:8000
