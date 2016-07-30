function IncomeDataRepository(path){
    if(!path.endsWith('.csv')){
        return;
    }
    this.path = path;
}

IncomeDataRepository.prototype.init = function(){
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
            if(entry[0] != "Year"){
                entries.push(new IncomeDataModel(entry[0], entry[1], entry[2], entry[3], entry[4], entry[5]));
            }
        });
        //console.debug(entries);
        self.entries = entries;
        self.clean();
    });
}

IncomeDataRepository.prototype.clean = function(){
    this.entries = _.filter(this.entries, function(entry){
        return entry.year && entry.region && entry.ethnicGroup && entry.measure && entry.value;
    });
}

IncomeDataRepository.prototype.getEntries = function(){
    return this.entries;
}

IncomeDataRepository.prototype.getAllForYear = function(searchYear){
    return _.filter(this.entries, function(entry){ 
        return entry.year == searchYear; 
    });
}

IncomeDataRepository.prototype.getAllForRegion = function(searchRegion){
    return _.filter(this.entries, function(entry){ 
        return entry.region.includes(searchRegion); 
    });
}

IncomeDataRepository.prototype.getAllForEthnicity = function(searchEthnicity){
    return _.filter(this.entries, function(entry){ 
        return entry.ethnicGroup.includes(searchEthnicity); 
    });
}

IncomeDataRepository.prototype.getAllValuesMatching = function(operator, searchValue){
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


//Year,Region,Ethnic Group,Measure,Value,Flags
function IncomeDataModel(year, region, ethnicGroup, measure, value, flags){
    this.year = year;
    this.region = region;
    this.ethnicGroup = ethnicGroup;
    this.measure = measure;
    this.value = value;
    this.flags = flags;
}
