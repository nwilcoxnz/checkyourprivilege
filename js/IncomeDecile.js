function IncomeDecileDataRepository(path){
    if(!path.endsWith('.csv')){
        return;
    }
    this.path = path;
}

IncomeDecileDataRepository.prototype.init = function(){
    this.promise = $.ajax({
        url: this.path
    });

    $.when(this.promise, this).done(function(promise, self){
        var csvFileString = promise[0];
        csvFileString = csvFileString.replace(/"/g, '');
        var lines = csvFileString.split('\r\n');
        var entries = [];

        _.each(lines, function(line){
            var entry = line.split(',');
            if(entry[0] != "decile"){
                if(self.index.length > 2 && self.index[2] == "sex"){
                    entries.push(new IncomeDecileDataModel(entry[0], entry[1], entry[2], ""));
                }else if(self.index.length > 2 && self.index[2] == "age"){
                    entries.push(new IncomeDecileDataModel(entry[0], entry[1], "", entry[2]));
                }else{
                    entries.push(new IncomeDecileDataModel(entry[0], entry[1]));
                }
            }else{
                self.index = entry;
            }
        });
        //console.debug(entries);
        self.entries = entries;
        self.clean();
    });
}

IncomeDecileDataRepository.prototype.toDecileKey = function(value){
    if(value < 1000){
        return 0;
    }
    if(value < 11500){
        return 1;
    }
    if(value < 17800){
        return 2;
    }
    if(value < 24100){
        return 3;
    }
    if(value < 32500){
        return 4;
    }
    if(value < 41700){
        return 5;
    }
    if(value < 51600){
        return 6;
    }
    if(value < 65000){
        return 7;
    }
    if(value < 88200){
        return 8;
    }
    return 9;
}

IncomeDecileDataRepository.prototype.fromDecileKey = function(key){
    switch(key){
        case "0":
            return "under $1000";
        case "1":
            return "$1,000 - $11,499";
        case "2":
            return "$11,500 - $17,799";
        case "3":
            return "$17,800 - $24,099";
        case "4":
            return "$24,100 - $32,499";
        case "5":
            return "$32,500 - $41,699";
        case "6":
            return "$41,700 - $51,599";
        case "7":
            return "$51,600 - $64,999";
        case "8":
            return "$65,000 - $88,199";
        case "9":
            return "$88,200+";
        case "10":
            return "under $11,499"
    }
}

//totals
IncomeDecileDataRepository.prototype.getDecileTotalValue = function(key){
    switch(key){
        case "0":
            return 1000;
        case "1":
            return 11499;
        case "2":
            return 17799;
        case "3":
            return 24099;
        case "4":
            return 32499;
        case "5":
            return 41699;
        case "6":
            return 51599;
        case "7":
            return 64999;
        case "8":
            return 88199;
        case "9":
            return 88200;
        case "10":
            return 11499;
    }
}

IncomeDecileDataRepository.prototype.toAgeKey = function(){
    if(value < 20){
        return 0;
    }
    if(value < 25){
        return 1;
    }
    if(value < 30){
        return 2;
    }
    if(value < 35){
        return 3;
    }
    if(value < 40){
        return 4;
    }
    if(value < 45){
        return 5;
    }
    if(value < 50){
        return 6;
    }
    if(value < 55){
        return 7;
    }
    if(value < 60){
        return 8;
    }
    return 9;
}

IncomeDecileDataRepository.prototype.fromAgeKey = function(){
    switch(key){
        case 0:
            return "15 - 19";
        case 1:
            return "20 - 24";
        case 2:
            return "25 - 29";
        case 3:
            return "30 - 34";
        case 4:
            return "35 - 39";
        case 5:
            return "40 - 44";
        case 6:
            return "45 - 49";
        case 7:
            return "50 - 54";
        case 8:
            return "55 - 59";
        case 9:
            return "60 - 64";
        case 10:
            return "65+";
    }
}

IncomeDecileDataRepository.prototype.clean = function(){
    this.entries = _.filter(this.entries, function(entry){
        return entry.decile && entry.value;
    });
}

IncomeDecileDataRepository.prototype.getEntries = function(){
    return this.entries;
}

IncomeDecileDataRepository.prototype.getAllForAgeGroup = function(ageGroup){
    return _.filter(this.entries, function(entry){ 
        return entry.age == ageGroup; 
    });
}

IncomeDecileDataRepository.prototype.getAllForSex = function(searchSex){
    return _.filter(this.entries, function(entry){ 
        return entry.sex.includes(searchSex); 
    });
}

IncomeDecileDataRepository.prototype.getAllForDecile = function(searchDecile){
    return _.filter(this.entries, function(entry){ 
        return entry.decile.includes(searchDecile); 
    });
}

IncomeDecileDataRepository.prototype.getAllValuesMatching = function(operator, searchValue){
    function lt(actual, expected){
        return actual < expected;
    }
    function lte(actual, expected){
        return actual <= expected;
    }
    function gt(actual, expected){
        return actual > expected;
    }
    function gte(actual, expected){
        return actual >= expected;
    }
    function eq(actual, expected){
        return actual == expected;
    }
    function neq(actual, expected){
        return actual != expected;
    }

    var operationMethod;
    if(operator.startsWith(">")){
        if(operator.startsWith(">=")){
            operationMethod = gte;
        }else{
            operationMethod = gt;
        }
    }

    if(operator.startsWith("<")){
        if(operator.startsWith("<=")){
            operationMethod = lte
        }else{
            operationMethod = lt
        }
    }

    if(operator.startsWith("==")){
        operationMethod = eq
    }

    if(operator.startsWith("!=")){
        operationMethod = ne
    }

    return _.filter(this.entries, function(entry){ 
        return operationMethod(entry.value, searchValue);
    });
}


function IncomeDecileDataModel(decile, value, sex, age){
    this.decile = decile;
    this.value = value;
    this.sex = sex;
    this.age = age;
}
