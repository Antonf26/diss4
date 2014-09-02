/**
 * Created by Anton on 02/09/2014.
 */
exports.attributeIsUnique = function(array, attrName)
{

    var attrValues = [];
    for (var i in array)
    {
        if(array[i][attrName])
        {
            if(attrValues.indexOf(array[i][attrName]) > -1)
            {
                return false;
            }
            else
            {
                attrValues.push(array[i][attrName]);
            }
        }
    }
    return true;
};



exports.containsValidChars = function(string)
{
    var regExp = /^\w+$/;
    return regExp.test(string);

};

exports.containsSmallLetter = function(string)
{
    var regExp = /[a-z]/;
    return regExp.test(string);
};

exports.containsCapitalLetter = function(string)
{
    var regExp = /[A-Z]/;
    return regExp.test(string);
};

exports.containsNumber = function(string)
{
    var regExp = /[0-9]/;
    return regExp.test(string);
};


