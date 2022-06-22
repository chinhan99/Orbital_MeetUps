import re
import urllib3
import json
from datetime import datetime, date, time


with open('start_date.json') as file:
    sem_start_date = json.load(file)

academic_year = sem_start_date['AY']


# JSON QUery to get venue information in sem1
http = urllib3.PoolManager()
request_query = 'https://api.nusmods.com/v2/' + academic_year + '/semesters/1/venueInformation.json'
r = http.request('GET',request_query)
#All the venue information in sem 1 is the response
json_load = json.loads(r.data.decode('utf-8'))
#Store into a file called venues_sem1.json
with open('venues_sem1.json', 'w', encoding='utf-8') as f:
    json.dump(json_load, f, ensure_ascii=False, indent=4)


request_query = 'https://api.nusmods.com/v2/' + academic_year + '/semesters/2/venueInformation.json'
r = http.request('GET',request_query)
#All the venue information in sem 2 is the response
json_load = json.loads(r.data.decode('utf-8'))
#Store into a file called venues_sem2.json
with open('venues_sem2.json', 'w', encoding='utf-8') as f:
    json.dump(json_load, f, ensure_ascii=False, indent=4)


request_query = 'https://api.nusmods.com/v2/' + academic_year + '/semesters/3/venueInformation.json'
r = http.request('GET',request_query)
#All the venue information in spectial term 1 is the response
json_load = json.loads(r.data.decode('utf-8'))
#Store into a file called venues_st1.json
with open('venues_st1.json', 'w', encoding='utf-8') as f:
    json.dump(json_load, f, ensure_ascii=False, indent=4)


request_query = 'https://api.nusmods.com/v2/' + academic_year + '/semesters/4/venueInformation.json'
r = http.request('GET',request_query)
#All the venue information in spectial term 2 is the response
json_load = json.loads(r.data.decode('utf-8'))
#Store into a file called venues_st2.json
with open('venues_st2.json', 'w', encoding='utf-8') as f:
    json.dump(json_load, f, ensure_ascii=False, indent=4)



