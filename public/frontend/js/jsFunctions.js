$(document).ready(function(){
	hideDiv();
});
var i=0;
function hideDiv()
{
	if(i==2)
	{
		$("#message,#message_error,#secret_error,.help-block").fadeOut('slow');
	}	
	else
	{
		i++;	
	}
	setTimeout("hideDiv()",4000);
}	

function archive_fun(itemname)
{
	if(confirm("Are you sure you want to deactivate your account."))
	{
		return true;
	}
	else
	{
		return false;	
	}		
}
