import re
import urllib3
import json
from datetime import datetime, date, time


#JSON query
http = urllib3.PoolManager()

with open('start_date.json') as file:
    sem_start_date = json.load(file)

academic_year = sem_start_date['AY']

request_query = 'https://api.nusmods.com/v2/' + academic_year + '/moduleList.json'
r = http.request('GET',request_query)

#A list of all the module in the current academic year will print given in the 
#response json query
json_load = json.loads(r.data.decode('utf-8'))

#Store it as a file called modules.json
with open('modules.json', 'w', encoding='utf-8') as f:
    json.dump(json_load, f, ensure_ascii=False, indent=4)

