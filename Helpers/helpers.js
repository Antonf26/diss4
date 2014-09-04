//Hold miscellaneous helper funciton

//Checks wether all values in the pssed in array have a unique value for the specified attribute
exports.attributeIsUnique = function(array, attrName)
{
    var attrValues = [];
    for (var i in array)
    {
        if(array[i][attrName])
        {
            if(attrValues.indexOf(array[i][attrName]) > -1)  //If we've already come across this value, then it's not unique
            {
                return false;
            }
            else
            {
                attrValues.push(array[i][attrName]); //If not, store it for checkign against
            }
        }
    }
    return true;
};


//Checks wether passed in string contains only letters, numbers and underscore
exports.containsValidChars = function(string)
{
    var regExp = /^\w+$/;
    return regExp.test(string);

};

//Checks wether at least one lowercase letter is present in the string passed in
exports.containsLowercaseLetter = function(string)
{
    var regExp = /[a-z]/;
    return regExp.test(string);
};

//Checks wether at least one uppercase letter is present in the string passed in
exports.containsUppercaseLetter = function(string)
{
    var regExp = /[A-Z]/;
    return regExp.test(string);
};

//Checks wether at least one number is present in the string passed in
exports.containsNumber = function(string)
{
    var regExp = /[0-9]/;
    return regExp.test(string);
};




