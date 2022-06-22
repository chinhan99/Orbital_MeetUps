# Import required libraries
import re
import urllib3
import json
import pymongo
from datetime import datetime, date, time, timedelta
from pymongo import MongoClient, InsertOne

with open('config.json') as file:
    config_data = json.load(file)

username = config_data["MONGODB_USERNAME"]
password = config_data["MONGODB_PASSWORD"]

# Establish connection and connect to 'mydatabase' database
client = pymongo.MongoClient("mongodb+srv://" + username + ":" + password + "@cluster0.20uxruv.mongodb.net/?retryWrites=true&w=majority")


# The first part of the code will be storing for semester 1

# Establish connection to the first semester
db = client['venue_availability_sem1']
# All the collections inside the database
all_collection_sem = ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7', 'Week 8', 'Week 9', 'Week 10', 'Week 11', 'Week 12', 'Week 13']

# Delete all the current entries inside the database because we are creating from scratch
for i in all_collection_sem:
    collection = db[i]
    x = collection.delete_many({})

with open('start_date.json') as file:
    sem_start_date = json.load(file)

# Open venues_sem1.json which contains the classes used for each location
with open('venues_sem1.json') as file:
    file_data = json.load(file)


# Current count of data stored is 0
count = 0
for location in file_data:
    # Inside the location (file_data[location]) contains an array of dictionary where each index is the day
    if location != "E-Learn_C":
        # location_class will show all the 
        for location_class in file_data[location]:
            for i in range(1, 14):
                collection = db['Week ' + str(i)]
                classes_slot = [("0800", "0800")]
                for j in location_class['classes']:
                    
                    # Check if the classes are arrange in the form of start and end date
                    if (isinstance(j['weeks'], dict)):
                        # Get the start date and the end date
                        class_start_date = j['weeks']['start']
                        class_end_date = j['weeks']['end']

                        # Split the start and end date based on "-" so that the year, month and date can be retrived
                        class_start_date = class_start_date.split("-")
                        class_end_date = class_end_date.split("-")

                        # Get the class date and the class end date based on date format
                        class_date = date(int(class_start_date[0]), int(class_start_date[1]), int(class_start_date[2]))
                        class_end = date(int(class_end_date[0]), int(class_end_date[1]), int(class_end_date[2]))

                        # Get the start date of the semester
                        sem_start = sem_start_date["Sem 1"].split('-')
                        
                        # class_week is the week where there is classes
                        class_week = []


                        if "weeks" in j['weeks']:
                            # If weeks is inside the dict, it means that it does not have lessons every week
                            # Thus find the weeks that have lessons

                            weeks_count = 1
                            while class_date <= class_end:
                                # While the class date is not exceeding the end date, keep running the same loop to append the classes into
                                # the week
                                date_diff =  class_date - date(int(sem_start[0]), int(sem_start[1]), int(sem_start[2]))
                                if weeks_count in j['weeks']['weeks']:
                                    if (date_diff.days < 42):
                                        class_week.append(int(date_diff.days/7) + 1)
                                    
                                    elif (date_diff.days > 49):
                                        class_week.append(int((date_diff.days - 7)/7) + 1)

                                class_date += timedelta(days = 7) 
                                weeks_count += 1
                            
                            j['weeks'] = class_week


                        else:
                            # If there is no weeks, it means there is lesson every week
                            
                            
                            while class_date <= class_end:
                                # While the class date is not exceeding the end date, keep running the same loop to append the classes into
                                # the week
                                date_diff =  class_date - date(int(sem_start[0]), int(sem_start[1]), int(sem_start[2]))

                                # If the days is less than 42, it means it's the first half of the semester, as there is no recess week
                                # However, if the days is more than 49, it means that it has gone beyond recess week, which explains why
                                # there is an additional 7 days
                                if (date_diff.days < 42):
                                    class_week.append(int(date_diff.days/7) + 1)
                                    
                                elif (date_diff.days > 49):
                                    class_week.append(int((date_diff.days - 7)/7) + 1)
                                class_date += timedelta(days = 7)

                            # Changwe the weeks at the end after all the weeks of classes has been appended
                            j['weeks'] = class_week
                        
                        
            
                    
                    if i in j['weeks']:
                        # Append the class in the array if the week have lesson
                        classes_slot.append((j['startTime'], j['endTime']))
                
                # Append the last class timing
                classes_slot.append(("2359", "2359"))
                # Sort it in case any class is not sorted
                classes_slot = sorted(classes_slot)
                free_slot = []
                # Get the free slots
                for start, end in ((classes_slot[k][1], classes_slot[k+1][0]) for k in range(len(classes_slot) - 1)):
                    if end > start:
                        free_slot.append((str(start), str(end)))
                
                # Store the free slots
                collection.insert_one({"Venue" : location, "Day": location_class['day'], "Availability Timeslot" : free_slot})
    count += 1
    print("Semester 1: " + str(count) + "/" + str(len(file_data)) + " Completed...")





# The first part of the code will be storing for semester 2
# Establish connection to the first semester
db = client['venue_availability_sem2']


# Delete all the current entries inside the database because we are creating from scratch
for i in all_collection_sem:
    collection = db[i]
    x = collection.delete_many({})

# Open venues_sem2.json which contains the classes used for each location
with open('venues_sem2.json') as file:
    file_data = json.load(file)

# Current count of data stored is 0
count = 0
for location in file_data:
    # Inside the location (file_data[location]) contains an array of dictionary where each index is the day
    if location != "E-Learn_C":
        # location_class will show all the 
        for location_class in file_data[location]:
            # Go through the weeks from week 1 to 13
            for i in range(1, 14):
                # Change the collection to the weeks so each data will be stored in the right place
                collection = db['Week ' + str(i)]
                # Store the first class as 8am
                classes_slot = [("0800", "0800")]
                for j in location_class['classes']:
                    
                    # Check if the classes are arrange in the form of start and end date
                    if (isinstance(j['weeks'], dict)):
                        # Get the start date and the end date
                        class_start_date = j['weeks']['start']
                        class_end_date = j['weeks']['end']

                        # Split the start and end date based on "-" so that the year, month and date can be retrived
                        class_start_date = class_start_date.split("-")
                        class_end_date = class_end_date.split("-")

                        # Get the class date and the class end date based on date format
                        class_date = date(int(class_start_date[0]), int(class_start_date[1]), int(class_start_date[2]))
                        class_end = date(int(class_end_date[0]), int(class_end_date[1]), int(class_end_date[2]))

                        # Get the start date of the semester
                        sem_start = sem_start_date["Sem 2"].split('-')
                        
                        # class_week is the week where there is classes
                        class_week = []


                        if "weeks" in j['weeks']:
                            # If weeks is inside the dict, it means that it does not have lessons every week
                            # Thus find the weeks that have lessons

                            weeks_count = 1
                            while class_date <= class_end:
                                # While the class date is not exceeding the end date, keep running the same loop to append the classes into
                                # the week
                                date_diff =  class_date - date(int(sem_start[0]), int(sem_start[1]), int(sem_start[2]))
                                if weeks_count in j['weeks']['weeks']:
                                    if (date_diff.days < 42):
                                        class_week.append(int(date_diff.days/7) + 1)
                                    
                                    elif (date_diff.days > 49):
                                        class_week.append(int((date_diff.days - 7)/7) + 1)
                                
                                class_date += timedelta(days = 7)
                                weeks_count += 1
                            
                            j['weeks'] = class_week


                        else:
                            # If there is no weeks, it means there is lesson every week
                            
                            
                            while class_date <= class_end:
                                # While the class date is not exceeding the end date, keep running the same loop to append the classes into
                                # the week
                                date_diff =  class_date - date(int(sem_start[0]), int(sem_start[1]), int(sem_start[2]))

                                # If the days is less than 42, it means it's the first half of the semester, as there is no recess week
                                # However, if the days is more than 49, it means that it has gone beyond recess week, which explains why
                                # there is an additional 7 days
                                if (date_diff.days < 42):
                                    class_week.append(int(date_diff.days/7) + 1)
                                    
                                elif (date_diff.days > 49):
                                    class_week.append(int((date_diff.days - 7)/7) + 1)
                                class_date += timedelta(days = 7)

                            # Changwe the weeks at the end after all the weeks of classes has been appended
                            j['weeks'] = class_week
                        
                        
            
                    # If the  current week has lesson then append the lesson time into classes_slot
                    if i in j['weeks']:
                        classes_slot.append((j['startTime'], j['endTime']))
                
                # Add the last timing
                classes_slot.append(("2359", "2359"))
                # Sort the class in case it's not already sorted
                classes_slot = sorted(classes_slot)
                free_slot = []

                # Find the free slot
                for start, end in ((classes_slot[k][1], classes_slot[k+1][0]) for k in range(len(classes_slot) - 1)):
                    if end > start:
                        free_slot.append((str(start), str(end)))
                
                # Store into the database
                collection.insert_one({"Venue" : location, "Day": location_class['day'], "Availability Timeslot" : free_slot})

    count += 1
    print("Semester 2: " + str(count) + "/" + str(len(file_data)) + " Completed...")



# The first part of the code will be storing for special term 1
# Establish connection to the special term 1
db = client['venue_availability_st1']

# All the collections inside the database
all_collection_sem = ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6']

# Delete all the current entries inside the database because we are creating from scratch
for i in all_collection_sem:
    collection = db[i]
    x = collection.delete_many({})

# Open venues_sem1.json which contains the classes used for each location
with open('venues_st1.json') as file:
    file_data = json.load(file)

# Current count of data stored is 0
count = 0
for location in file_data:
    # Inside the location (file_data[location]) contains an array of dictionary where each index is the day
    if location != "E-Learn_C":
        # location_class will show all the location that is used during this sem
        for location_class in file_data[location]:
            # i is the weeks from week 1 to week 13 where it indicates the week
            for i in range(1, 7):
                # Select the weeks where that is in the collection for proper data storage
                collection = db['Week ' + str(i)]
                classes_slot = [("0800", "0800")]
                for j in location_class['classes']:
                    
                    # Check if the classes are arrange in the form of start and end date
                    if (isinstance(j['weeks'], dict)):
                        # Get the start date and the end date
                        class_start_date = j['weeks']['start']
                        class_end_date = j['weeks']['end']

                        # Split the start and end date based on "-" so that the year, month and date can be retrived
                        class_start_date = class_start_date.split("-")
                        class_end_date = class_end_date.split("-")

                        # Get the class date and the class end date based on date format
                        class_date = date(int(class_start_date[0]), int(class_start_date[1]), int(class_start_date[2]))
                        class_end = date(int(class_end_date[0]), int(class_end_date[1]), int(class_end_date[2]))

                        # Get the start date of the semester
                        sem_start = sem_start_date["Special Term 1"].split('-')
                        
                        # class_week is the week where there is classes
                        class_week = []


                        if "weeks" in j['weeks']:
                            # If weeks is inside the dict, it means that it does not have lessons every week
                            # Thus find the weeks that have lessons

                            weeks_count = 1
                            while class_date <= class_end:
                                # While the class date is not exceeding the end date, keep running the same loop to append the classes into
                                # the week
                                date_diff =  class_date - date(int(sem_start[0]), int(sem_start[1]), int(sem_start[2]))
                                if weeks_count in j['weeks']['weeks']:
                                    if (date_diff.days < 42):
                                        class_week.append(int(date_diff.days/7) + 1)
                                    
                                    elif (date_diff.days > 49):
                                        class_week.append(int((date_diff.days - 7)/7) + 1)
                                
                                class_date += timedelta(days = 7) 
                                weeks_count += 1
                            
                            j['weeks'] = class_week


                        else:
                            # If there is no weeks, it means there is lesson every week
                            
                            
                            while class_date <= class_end:
                                # While the class date is not exceeding the end date, keep running the same loop to append the classes into
                                # the week
                                date_diff =  class_date - date(int(sem_start[0]), int(sem_start[1]), int(sem_start[2]))

                                # If the days is less than 42, it means it's the first half of the semester, as there is no recess week
                                # However, if the days is more than 49, it means that it has gone beyond recess week, which explains why
                                # there is an additional 7 days
                                if (date_diff.days < 42):
                                    class_week.append(int(date_diff.days/7) + 1)
                                    
                                elif (date_diff.days > 49):
                                    class_week.append(int((date_diff.days - 7)/7) + 1)
                                class_date += timedelta(days = 7)

                            # Changwe the weeks at the end after all the weeks of classes has been appended
                            j['weeks'] = class_week
                        
                        
            
                    # If the week has lesson, then append into classes_slot
                    if i in j['weeks']:
                        classes_slot.append((j['startTime'], j['endTime']))
                
                # Append the last timing
                classes_slot.append(("2359", "2359"))
                # Sort the array in case it's not sorted
                classes_slot = sorted(classes_slot)
                free_slot = []
                # Calculate the free slot
                for start, end in ((classes_slot[k][1], classes_slot[k+1][0]) for k in range(len(classes_slot) - 1)):
                    if end > start:
                        free_slot.append((str(start), str(end)))
                
                # Store in database
                collection.insert_one({"Venue" : location, "Day": location_class['day'], "Availability Timeslot" : free_slot})

    count += 1
    print("Special Term 1: " + str(count) + "/" + str(len(file_data)) + " Completed...")






# The first part of the code will be storing for special term 2
# Establish connection to the special term 2
db = client['venue_availability_st2']

# All the collections inside the database
all_collection_sem = ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6']

# Delete all the current entries inside the database because we are creating from scratch
for i in all_collection_sem:
    collection = db[i]
    x = collection.delete_many({})

# Open venues_sem1.json which contains the classes used for each location
with open('venues_st2.json') as file:
    file_data = json.load(file)

# Current count of data stored is 0
count = 0
for location in file_data:
    # Inside the location (file_data[location]) contains an array of dictionary where each index is the day
    if location != "E-Learn_C":
        # location_class will show all the location used for the semester
        for location_class in file_data[location]:
            for i in range(1, 7):
                # Access the collection based on the weeks
                collection = db['Week ' + str(i)]
                # Use 8am as the first class
                classes_slot = [("0800", "0800")]

                for j in location_class['classes']:
                    
                    # Check if the classes are arrange in the form of start and end date
                    if (isinstance(j['weeks'], dict)):
                        # Get the start date and the end date
                        class_start_date = j['weeks']['start']
                        class_end_date = j['weeks']['end']

                        # Split the start and end date based on "-" so that the year, month and date can be retrived
                        class_start_date = class_start_date.split("-")
                        class_end_date = class_end_date.split("-")

                        # Get the class date and the class end date based on date format
                        class_date = date(int(class_start_date[0]), int(class_start_date[1]), int(class_start_date[2]))
                        class_end = date(int(class_end_date[0]), int(class_end_date[1]), int(class_end_date[2]))

                        # Get the start date of the semester
                        sem_start = sem_start_date["Special Term 2"].split('-')
                        
                        # class_week is the week where there is classes
                        class_week = []


                        if "weeks" in j['weeks']:
                            # If weeks is inside the dict, it means that it does not have lessons every week
                            # Thus find the weeks that have lessons

                            weeks_count = 1
                            while class_date <= class_end:
                                # While the class date is not exceeding the end date, keep running the same loop to append the classes into
                                # the week
                                date_diff =  class_date - date(int(sem_start[0]), int(sem_start[1]), int(sem_start[2]))
                                if weeks_count in j['weeks']['weeks']:
                                    if (date_diff.days < 42):
                                        class_week.append(int(date_diff.days/7) + 1)
                                    
                                    elif (date_diff.days > 49):
                                        class_week.append(int((date_diff.days - 7)/7) + 1)
                                
                                class_date += timedelta(days = 7)
                                weeks_count += 1
                            
                            j['weeks'] = class_week


                        else:
                            # If there is no weeks, it means there is lesson every week
                            
                            
                            while class_date <= class_end:
                                # While the class date is not exceeding the end date, keep running the same loop to append the classes into
                                # the week
                                date_diff =  class_date - date(int(sem_start[0]), int(sem_start[1]), int(sem_start[2]))

                                # If the days is less than 42, it means it's the first half of the semester, as there is no recess week
                                # However, if the days is more than 49, it means that it has gone beyond recess week, which explains why
                                # there is an additional 7 days
                                if (date_diff.days < 42):
                                    class_week.append(int(date_diff.days/7) + 1)
                                    
                                elif (date_diff.days > 49):
                                    class_week.append(int((date_diff.days - 7)/7) + 1)
                                class_date += timedelta(days = 7)

                            # Changwe the weeks at the end after all the weeks of classes has been appended
                            j['weeks'] = class_week
                        
                        
            
                    # If the week have lesson, store it into the array
                    if i in j['weeks']:
                        classes_slot.append((j['startTime'], j['endTime']))
                
                # Store the last timing of the day
                classes_slot.append(("2359", "2359"))
                # Sort the array in case it's not sorted yet
                classes_slot = sorted(classes_slot)
                free_slot = []
                # Find the free slot
                for start, end in ((classes_slot[k][1], classes_slot[k+1][0]) for k in range(len(classes_slot) - 1)):
                    if end > start:
                        free_slot.append((str(start), str(end)))
                
                # Store into the database
                collection.insert_one({"Venue" : location, "Day": location_class['day'], "Availability Timeslot" : free_slot})

    count += 1
    print("Special Term 2: " + str(count) + "/" + str(len(file_data)) + " Completed...")

