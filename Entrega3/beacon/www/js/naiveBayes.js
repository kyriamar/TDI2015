// n.train({ "beacon_cuarto":10, "beacon_cocina": 0},"cuarto");
// n.train({ "beacon_cuarto":12, "beacon_cocina": 0},"cuarto");
// n.train({ "beacon_cuarto":9,  "beacon_cocina": 1},"cuarto");
// n.train({ "beacon_cuarto":6,  "beacon_cocina": 4},"cuarto");
// n.train({ "beacon_cuarto":20, "beacon_cocina": 0},"cuarto");
// n.train({ "beacon_cuarto":0, "beacon_cocina": 10},"cocina");
// n.train({ "beacon_cuarto":0, "beacon_cocina": 12},"cocina");
// n.train({ "beacon_cuarto":2, "beacon_cocina": 8},"cocina");
// n.train({ "beacon_cuarto":4, "beacon_cocina": 6},"cocina");
// n.train({ "beacon_cuarto":5, "beacon_cocina": 6},"cocina");


var NaiveBayes = function () {
    this.data = [];
    this.columns = [];
    this.classes = {};

    //Distribution container
    this.distribution = {
        normal: function (value, mean, stDev) {
            return (1 / (Math.sqrt(2 * Math.PI) * stDev)) * Math.exp(Math.pow(value - mean, 2) * (-1) / (2 * Math.pow(stDev, 2)))
        }
    };

}


NaiveBayes.prototype = {

    train: function (input, className) {

        //Add new training data to the datastore
        this.data.push({ input: input, className: className });

        //Update classes container
        if (!this.classes.hasOwnProperty(className)) {            
            this.classes[className] = { name: className };
            for(var column in input){
                Object.defineProperty(this.classes[className], column, { value: {}, writable: true, readable:true, enumerable: true, configurable:true});
            }
        }

        //Update columns container
        for (var column in input) {
            
            if (this.columns.indexOf(column) == -1) {
                this.columns.push(column);
            }
        }

        this.updateStatisticals();
    },

    //Update mean for the entire dataset for a spesified column
    updateMean: function (column, className) {
        var mean = 0;
        var sum = 0;
        var length = 0;
        for (var dataRow in this.data) {
            if (this.data[dataRow].className === className) {
                sum = sum + this.data[dataRow].input[column];
                length++;
            }
            
        }
        mean = sum / length;
        this.classes[className].count = length;
        this.classes[className][column].mean = mean;
    },


    //Update standard deviation for the entire dataset for a spesified column
    updateStDev: function (column, className) {
        var sum = 0;
        var length = 0;
        var mean = this.classes[className][column].mean;

        for (var dataRow in this.data) {
            if (this.data[dataRow].className === className) {
                sum = sum + Math.pow(this.data[dataRow].input[column] - mean, 2);
                length++;
            }
        }
        
        this.classes[className][column].stDev = Math.pow((1 / (length - 1)) * sum, 0.5);
        
    },

    //Wrapper method to update both, standard deviation and and mean
    updateStatisticals: function(){
        for (var column in Object.keys(this.columns)) {
            for (var className in this.classes) {
                
                this.updateMean(this.columns[column], this.classes[className].name);
                this.updateStDev(this.columns[column], this.classes[className].name);

            }
        }
    },

    normal: function (value, mean, stDev) {
        return this.distribution.normal(value, mean, stDev);
    },

    classify: function (input) {

        var total = this.data.length;

        var results = { highestProbability: 0, className: '' };
        console.log('Probability P(DistProp | Given):');
        console.log("--------------------------------");
        
        for (var className in this.classes) {

            
            var classNameCount = this.classes[className].count;
            var portionOfTotalClasses = (classNameCount / total);

            console.log("P(class = " + className + ")", (classNameCount / total));
            var propertyContainer = [];
            for (var property in input) {

                var dist = this.normal(input[property], this.classes[className][property].mean, this.classes[className][property].stDev);
                
                console.log("P(" + property + "|" + this.classes[className].name + ")", dist);
                propertyContainer.push(dist);
                var productOfDistributions = propertyContainer.reduce(function (a, b) {
                    return a * b;
                });
                
            }
            console.log("--------------------------------");
            var currentProbability = productOfDistributions * portionOfTotalClasses;
            if (currentProbability > results.highestProbability) {
                results.highestProbability = currentProbability;
                results.className = className;
            }

        }
        return results;

    }

}