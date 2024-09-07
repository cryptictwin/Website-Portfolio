
function GetById() {
     document.getElementById("div1").innerHTML=document.getElementById("num").value;
}
function GetByName()
{
    var nums= document.getElementByName("number");
    var res='';
    for(var i=0; i<nums.length; i++)
    {
        res+=nums[i].value +"<br/>";
        document.getElementById("div1").innerHTML= res;
    }
}
