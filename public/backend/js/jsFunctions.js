function dis_fun(itemname)
{
	if(confirm("Are you sure you want to disable this "+itemname))
	{
		return true;
	}
	else
	{
		return false;	
	}	
}

function enb_fun(itemname)
{
	
	if(confirm("Are you sure you want to enable this "+itemname))
	{
		return true;
	}
	else
	{
		return false;	
	}	
}
function archive_fun(itemname)
{
	if(confirm("Are you sure you want to archive this "+itemname))
	{
		return true;
	}
	else
	{
		return false;	
	}		
}

function featured_fun(itemname)
{
	if(confirm("Are you sure you want to featured this "+itemname))
	{
		return true;
	}
	else
	{
		return false;	
	}		
}

function unfeatured_fun(itemname)
{
	if(confirm("Are you sure you want to remove this "+itemname+" from featured list"))
	{
		return true;
	}
	else
	{
		return false;	
	}		
}
function confirmdefault()
{
	if(confirm("Are you sure you want to make this image as default image"))
	{
		return true;	
	}	
	else 
	{
		return false;	
	}
}

function confirmcancellation()
{
	if(confirm("Are you sure you want to cancel this withdrawl"))
	{
		return true;	
	}	
	else 
	{
		return false;	
	}	
}
function check_form(){
	var filter = $("#filter").val();
	var search_data = $("#search_data").val()
	if(filter == ""){
		alert("Please select filter");
	}
	else if(filter != "")
	{
		if(search_data == ""){
			alert("Please enter text in search box");
		}
		else{
			document.getElementById('search').submit()
		}
	}
	else{
			document.getElementById('search').submit()
		}
}
var i=0;

function hideDiv()
{
	if(i==2)
	{
		$("#message").fadeOut('slow');	
	}	
	else
	{
		i++;	
	}
	setTimeout("hideDiv()",3000);
}

$(document).ready(function()
{	
	//hideDiv();
});
function countdown(yr,m,d,hr,min)
{

theyear=yr;themonth=m;theday=d;thehour=hr;theminute=min;

var today=new Date();

var todayy=today.getYear();

if (todayy < 1000) 
{
	todayy+=1900; 
}

var todaym=today.getMonth();

var todayd=today.getDate();

var todayh=today.getHours();

var todaymin=today.getMinutes();

var todaysec=today.getSeconds();

var todaystring1=montharray[todaym]+" "+todayd+", "+todayy+" "+todayh+":"+todaymin+":"+todaysec;

var todaystring=Date.parse(todaystring1)+(tz*1000*60*60);

var futurestring1=(montharray[m-1]+" "+d+", "+yr+" "+hr+":"+min);

var futurestring=Date.parse(futurestring1)-(today.getTimezoneOffset()*(1000*60));

var dd=futurestring-todaystring;

var dday=Math.floor(dd/(60*60*1000*24)*1);

var dhour=Math.floor((dd%(60*60*1000*24))/(60*60*1000)*1);

var dmin=Math.floor(((dd%(60*60*1000*24))%(60*60*1000))/(60*1000)*1);

var dsec=Math.floor((((dd%(60*60*1000*24))%(60*60*1000))%(60*1000))/1000*1);

if(dday<=0&&dhour<=0&&dmin<=0&&dsec<=0){

document.getElementById('count2').innerHTML=current;
document.getElementById('count2').style.display="block";
document.getElementById('count2').style.width="390px";
document.getElementById('dday').style.display="none";
document.getElementById('dhour').style.display="none";
document.getElementById('dmin').style.display="none";
document.getElementById('dsec').style.display="none";
document.getElementById('days').style.display="none";
document.getElementById('hours').style.display="none";
document.getElementById('minutes').style.display="none";
document.getElementById('seconds').style.display="none";
return;
}
else 
{

jQuery("#dday span").text(dday);
jQuery("#dhour span").text(dhour);
jQuery("#dmin span").text(dmin);
jQuery("#dsec span").text(dsec);
//document.getElementById('count2').style.display="none";

//document.getElementById('dday').innerHTML=dday;
//document.getElementById('dhour').innerHTML=dhour;

//document.getElementById('dmin').innerHTML=dmin;

//document.getElementById('dsec').innerHTML=dsec;

setTimeout("countdown(theyear,themonth,theday,thehour,theminute)",1000);

}

}
