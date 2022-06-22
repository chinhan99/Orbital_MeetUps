import re
import urllib3
import json
import pymongo
from datetime import datetime, date, time, timedelta
from pymongo import MongoClient, InsertOne


# Map that count how many days difference from the first day of school
days = {'Monday' : 0, 'Tuesday' : 1, 'Wednesday' : 2, 'Thursday' : 3, 'Friday' : 4, 'Saturday' : 5}
all_collection = ['semester1', 'semester2', 'specialterm1', 'specialterm2']


with open('start_date.json') as file:
    sem_start_date = json.load(file)

academic_year = sem_start_date['AY']




sem1_start = sem_start_date['Sem 1'].split('-')
sem1_start_day = sem1_start[2]
sem1_start_month = sem1_start[1]
sem1_start_year = sem1_start[0]


sem2_start = sem_start_date['Sem 2'].split('-')
sem2_start_day = sem2_start[2]
sem2_start_month = sem2_start[1]
sem2_start_year = sem2_start[0]


st1_start = sem_start_date['Special Term 1'].split('-')
st1_start_day = st1_start[2]
st1_start_month = st1_start[1]
st1_start_year = st1_start[0]


st2_start = sem_start_date['Special Term 2'].split('-')
st2_start_day = st2_start[2]
st2_start_month = st2_start[1]
st2_start_year = st2_start[0]



with open('config.json') as file:
    config_data = json.load(file)

username = config_data["MONGODB_USERNAME"]
password = config_data["MONGODB_PASSWORD"]

# Establish connection and connect to 'mydatabase' database
client = pymongo.MongoClient("mongodb+srv://" + username + ":" + password + "@cluster0.20uxruv.mongodb.net/?retryWrites=true&w=majority")

db = client["timetables"]


# Delete all the data in 'timetable'
for i in all_collection:
    collection = db[i]
    x = collection.delete_many({})


http = urllib3.PoolManager()
with open('modules.json') as file:
    file_data = json.load(file)


for x in file_data:
    print(x['moduleCode'])

    # Query to get the module info from json request
    request_query = 'https://api.nusmods.com/v2/' + academic_year + '/modules/' + x['moduleCode'] + '.json'
    
    r = http.request('GET',request_query)
    try:   
        json_load = json.loads(r.data.decode('utf-8'))

        

        for i in json_load['semesterData']:
            
            if (i['semester'] == 1):
                collection = db['semester1']
                dates = datetime(int(sem1_start_year), int(sem1_start_month), int(sem1_start_day))
                
            elif (i['semester'] == 2):
                collection = db['semester2']
                dates = datetime(int(sem2_start_year), int(sem2_start_month), int(sem2_start_day))
                
            
            elif (i['semester'] == 3):
                collection = db['specialterm1']
                dates = datetime(int(st1_start_year), int(st1_start_month), int(st1_start_day))
                
            else:
                collection = db['specialterm2']
                dates = datetime(int(st2_start_year), int(st2_start_month), int(st2_start_day))
                
            

            for j in i['timetable']:
                lesson_date = []
                if (isinstance(j['weeks'], dict)):
                    #j['weeks']['start'] is the first lesson and j['weeks']['end'] is the last lesson
                    # It's in the form of YYYY-MM-DD
                    
                    module_date = datetime(int(j['weeks']['start'][0] + j['weeks']['start'][1] + j['weeks']['start'][2] + j['weeks']['start'][3]),int(j['weeks']['start'][5] + j['weeks']['start'][6]),int(j['weeks']['start'][8] + j['weeks']['start'][9]))
                    module_end_date = datetime(int(j['weeks']['end'][0] + j['weeks']['end'][1] + j['weeks']['end'][2] + j['weeks']['end'][3]),int(j['weeks']['end'][5] + j['weeks']['end'][6]),int(j['weeks']['end'][8] + j['weeks']['end'][9]))

                    while module_date <= module_end_date:
                        lesson_date.append(str(module_date.date()))
                        module_date += timedelta(days = 7)
                    
                else:
                
                    weeks = j['weeks']
                    add_days = j['day']

                    
                    for week_no in weeks:
                        # print(week_no)
                        
                        
                        if week_no >= 7:
                            lesson_date.append(str((dates + timedelta(days = (7 * (week_no - 1)) + 7 + days[add_days])).date()))
                        else:
                            lesson_date.append(str((dates + timedelta(days = 7 * (week_no - 1) + days[add_days])).date()))

                collection.insert_one({'ModuleCode' : json_load['moduleCode'], 'ClassNo' : j['classNo'], 'ClassType' : j['lessonType'], "LessonDay": j['day'],'StartTime' : j['startTime'], 'endTime' : j['endTime'], 'lessonDate' : str(lesson_date)})
    except:
        continue
            