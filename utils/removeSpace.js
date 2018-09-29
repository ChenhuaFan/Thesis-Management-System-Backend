function Trim(str)
{ 
    return str.replace(/(^\s*)|(\s*$)/g, ""); 
}

module.exports = Trim;