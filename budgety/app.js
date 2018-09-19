// BUDGET CONTROLLER
var budgetController = (function(){

    // Private functions
    var Expense = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calcPercentages = function(totalIncome){
        if (totalIncome > 0){
            this.percentage = Math.round(this.value/totalIncome * 100);
        } else {
            this.percentage = -1
        }
    };

    Expense.prototype.getPercentage = function(){
        return this.percentage;
    };

    var Income = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var calculateTotal = function(type){

        var sum = 0;

        data.allItems[type].forEach(function(current){
            sum += current.value;
        });

        data.totals[type] = sum;

    }

    var data = {

        allItems: {
            exp: [],
            inc: []
        },

        totals: {
            exp: 0,
            inc: 0
        },

        budget: 0,
        percentage: -1
    };


    // Public functions
    return{
        addItem: function(type, des, val){
            var newItem, ID;

            // Create new ID
            if (data.allItems[type].length > 0){
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else{
                ID = 0;
            };

            // Create new item
            if (type == 'exp'){
                newItem = new Expense(ID, des, val);
            } else if (type == 'inc'){
                newItem = new Income(ID, des, val);
            }

            // Push it into out data stracture
            data.allItems[type].push(newItem);

            // Return the new item created
            return newItem;
        },

        deleteItem: function(type, id){
            var ids, index;
            ids = data.allItems[type].map(function(cur){
                return cur.id;
            });

            index = ids.indexOf(id);

            if (index !== -1){
                data.allItems[type].splice(index, 1);
            }

        },

        calculateBudget: function(){

            // Calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');

            // Calculate the budget (income - expense)
            data.budget = data.totals.inc - data.totals.exp;

            // Calculate income percentage
            if(data.totals.inc > 0){
                data.percentage = Math.round(data.totals.exp / data.totals.inc * 100);
            } else {
                data.percentage = -1;
            }
        },

        calculatePercentages: function(){
            data.allItems.exp.forEach(function(cur){
                cur.calcPercentages(data.totals.inc);
            });
        },

        getPercentages: function(){
            var allPerc = data.allItems.exp.map(function(cur){
                return cur.getPercentage();
            });
            return allPerc;
        },

        getBudget: function(){
            return{
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
        }
        
    }

})();

// UI CONTROLLER
var UIController = (function(){
    var DOMStrings = {
        // Buttons
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputButton: '.add__btn',
        
        // Containers
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        container: '.container',

        // Labels
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        expensesPercentageLabel: '.item__percentage',
        dateLabel: '.budget__title--month'

    };

    var formatNumber = function(num, type){
        var numSplit, int, dec;

        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');
        
        int = numSplit[0];
        if (int.length > 3){
            int = int.substr(0, int.length -3) + "," + int.substr(int.length - 3, 3);
        }

        dec = numSplit[1];

        return (type == 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
    };

    var nodeListForEach = function(list, callback){
        for (var i = 0; i < list.length; i++){
            callback(list[i], i);
        }
    };
    
    return{
        
        getInput: function(){
            return{
                type: document.querySelector(DOMStrings.inputType).value,//inc or exp
                description: document.querySelector(DOMStrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMStrings.inputValue).value)
            };
        },
        addListItem: function(obj, type){
            var html, newHTML, element;

            // Create HTML string with placeholder text
            if (type == 'inc'){
                element = DOMStrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            } else if (type == 'exp'){
                element = DOMStrings.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }

            // Replace the placeholder with text
                newHTML = html.replace('%id%', obj.id).replace('%description%', obj.description).replace('%value%', formatNumber(obj.value, type));

            // Insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHTML);

        },

        deleteListItem: function(selectorID){
            var element = document.getElementById(selectorID); 

            element.parentNode.removeChild(element);
        },

        clearFields: function(){
            var fields, fieldsArray;
            fields = document.querySelectorAll(DOMStrings.inputDescription + ', ' + DOMStrings.inputValue);

            fieldsArray = Array.prototype.slice.call(fields);

            fields.forEach(function(current){
                current.value = '';
            });

            fieldsArray[0].focus();
        },

        displayBudget: function(obj){
            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';

            document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMStrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMStrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');

            if (obj.percentage > 0){
                document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMStrings.percentageLabel).textContent = '---';
            };
        },

        displayPercentages: function(percentages){
            
            var fields = document.querySelectorAll(DOMStrings.expensesPercentageLabel);

            nodeListForEach(fields, function(current, index){
                if (percentages[index] > 0){
                    current.textContent = percentages[index] + '%';
            } else {
                current.textContent = '---';
            }
            });
        },

        displayMonth: function(){
            var now, month, months, year;

            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

            now = new Date();
            year = now.getFullYear();
            month = now.getMonth();

            document.querySelector(DOMStrings.dateLabel).textContent = months[month] + ' ' + year;
        },

        changedType: function(){

            var fields = document.querySelectorAll(
                DOMStrings.inputType + ',' +
                DOMStrings.inputDescription + ',' +
                DOMStrings.inputValue);

                nodeListForEach(fields, function(cur){
                    console.log(cur);
                    cur.classList.toggle('red-focus');
                });

                document.querySelector(DOMStrings.inputButton).classList.toggle('red');
        },

        getDOMStrings: function(){
            return DOMStrings;
        }
    };


})();
// GLOBAL APP CONTROLLER
var appController = (function(budgetCtrl, UICtrl){

    var setupEventListeners = function(){
        var DOM = UICtrl.getDOMStrings();

        document.querySelector(DOM.inputButton).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', function(event){
            if (event.key == 'Enter' || event.which == 13)
                ctrlAddItem();
        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
    };

    var updateBudget = function(){
        var budget;

        // 1. Calculate budget
        budgetCtrl.calculateBudget();

        // 2. return the budget
        budget = budgetCtrl.getBudget();

        // 3. display the budget
        UICtrl.displayBudget(budget);
    };

    var updatePercentages = function(){
        var percentages;

        // 1. Calculate percentages
        budgetCtrl.calculatePercentages();
        // 2. Read percentages from the controller
        percentages = budgetCtrl.getPercentages();
        // 3. Update the UI
        UICtrl.displayPercentages(percentages);
    };

    var ctrlAddItem = function(){
        var input, newItem;

        // 1. get input data
        input = UICtrl.getInput();

        if (input.description !== "" && !isNaN(input.value) && input.value > 0){
            // 2. add the item to budget controller
            newItem = budgetController.addItem(input.type, input.description, input.value);

            // 3. add the item to ui
            UICtrl.addListItem(newItem, input.type);

            // 4. Clear fields
            UICtrl.clearFields();

            // 5. Calc and Upd the budget
            updateBudget();

            // 6. Calculate and update percentages
            updatePercentages();
        };
    };

    var ctrlDeleteItem = function(event){
        var itemId, splitID, type, ID;
        itemId = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if (itemId){
            splitID = itemId.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            // 1. delete from data
            budgetCtrl.deleteItem(type, ID);
            // 2. delete from ui
            UICtrl.deleteListItem(itemId);

            //3. update and show budget
            updateBudget();

            //4. Calculate and update percentages
            updatePercentages();
        }
    };

    return{
        init: function(){
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget:0,
                totalInc: 0,
                totalExp:0,
                percentage: -1
            })
            setupEventListeners();
        }
    }
})(budgetController, UIController);

appController.init();
