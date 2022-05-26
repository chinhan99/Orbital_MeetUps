// API Call
function checkAvaAPI() {
      
    //Variable Declaration
    let list_of_modules = new Map();
    const semester = {"sem-1" : 1, "sem-2" : 2, "st-i" : 3, "st-ii" : 4};
    const lesson_type = {"LEC" : "Lecture", "TUT" : "Tutorial", "SEC" : "Sectional Teaching", "LAB" : "Laboratory", "PTUT" : "Packaged Tutorial", "PLEC" : "Packaged Lecture"};
    var lesson_slot = {"Monday" : [["0800", "0800"]], "Tuesday" : [["0800","0800"]], "Wednesday" : [["0800","0800"]], "Thursday" : [["0800","0800"]], "Friday" : [["0800","0800"]]};
    var each_module = [];
    var module_list = new Map();

    // //Sample Timetable
    // var nus_tt_links = ['https://nusmods.com/timetable/sem-2/share?CG2111A=LAB:04&CS1010=TUT:06,SEC:1&CS2040C=LAB:05,LEC:1&EE2023=PLEC:01,PTUT:02',
    //                     'https://nusmods.com/timetable/sem-1/share?CG1111A=LAB:02&CS1010=LAB:E04,TUT:05,SEC:1&ES1103=SEC:E17&PC1201=TUT:5,LEC:1',
    //                     'https://nusmods.com/timetable/sem-2/share?BAA6001=SEC:01&CG2111A=LAB:04&CM2288=&EC4332=SEM:1&EE2023=PLEC:02,PTUT:03&EE2023E=TUT:X1,LEC:P1&EE2111A=LAB:03&FIN3120B=SEC:A1&FIN3135=SEC:A1&GE2102=TUT:E3,LEC:1&GE2103=TUT:DO5,LEC:1&GEA1000=TUT:D61&MA1100=TUT:3,LEC:1'
    //                   ];
    
    const form = document.querySelector('#tt_link_process')
    const tt_inputs = form.querySelectorAll('#tt_link')
  //console.log(tt_inputs);
    let nus_tt_links = []

    tt_inputs.forEach(element => {
      const { value, name } = element
      if (value) {
        nus_tt_links [name] = value
      }
      nus_tt_links.push(element.value)
    
    })
    

    //console.log(nus_tt_links);

   

      

    
    var response;
    (async () => {

      //This for-loop is for each links. 
      for (let i = 0; i < nus_tt_links.length; i += 1)
      {
        //Splitting the links into 2 parts. The first part contains the semester while the second part contains the timetable itself
        each_timetable_module = nus_tt_links[i].split('?');
        //Splitting the timetable into each individual modules
        var each_module_class = each_timetable_module[1].split('&');

        //For loop to iterate through each of the modules
        for (let j = 0; j < each_module_class.length; j += 1)
        {
          //Splitting each of the module into their module code and their classes (At this point the class code and class type is still not split)
          var splitted_module_slot = each_module_class[j].split('=');

          //Split the class into different types (Lab, Tut) etc
          var module_slot_timetable = splitted_module_slot[1].split(',');
          var module_lesson_type = new Map();
          
          //Loop into each of the module timetable
          for (let l = 0; l < module_slot_timetable.length; l += 1)
          {
            //Split the class type and store into module_lesson_type (which is a map containing their class)
            var split = module_slot_timetable[l].split(":");
            module_lesson_type.set(split[0], split[1]);
          }
          
          //After all the classes type has been configured into a map, store into the module list where the module list will contain
          //the module code as the key and the map of class type and class code as the value
          module_list.set(splitted_module_slot[0], module_lesson_type);
        }

        //Iterate into each of the modules
        for (const [key, value] of module_list.entries())
        {
          //A sample API request
          var request_query = 'https://api.nusmods.com/v2/' + "2021" + '-' + "2022" + '/modules/' + key + '.json';
          response = await fetch(request_query, {method: 'GET'}).then((response) => response.json());
        
          //Iterate into the json response (which contains the crucial part)
          for (const [key2, value2] of Object.entries(response.semesterData)) 
          {
            for (const [key3, value3] of Object.entries(value2))
            {
              //Check that the current dict is the right semester (Checked based on regex)
              if (value3 == semester[each_timetable_module[0].match(/\w+-\w/)[0]])
              {
                //If it's the right semester, iterate further
                for (const [key4, value4] of Object.entries(value2.timetable))
                {
                  
                  for (const [key5, value5] of value.entries())
                  {
                    //Check that the lesson type and class code is correct
                    if ((value4.classNo == value5) && (value4['lessonType'] == lesson_type[key5]))
                    {
                      //If it's the correct class, append into a class list where it stores the lesson time
                      (lesson_slot[value4.day]).push([value4.startTime, value4.endTime]);
                    }
                  }                      
                }
              }
            }
          }
        }
        //After iterating one timetable, clear the module list and restart
        module_list.clear();
      }

      //Message will be the message that will be printed out
      var message = "";
      for (const [key, value] of Object.entries(lesson_slot))
      {
        //2359 is the end of the search. Can be change to differnt class timing. But take note that the class in NUS ends latest at 9pm
        (lesson_slot[key]).push(["2359", "2359"]);
        value.sort();
        
        //Check through the classes each day
        for (var i = 0; i < value.length - 1; i += 1)
        {
          //Check if there is any slots in between each classes
          if (parseInt(value[i][1]) < parseInt(value[i + 1][0]))
          {
            //Append the message if there is a free slot
            message = message + key + " " + value[i][1] + "-" + value[i + 1][0] + "\n";
          }
        }
        
      }
    alert(message);
    })();
    
  }