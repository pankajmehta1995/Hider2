function reload_win(){
	location.reload();
}
$(document).ready(function() {
	$("#mainchbx").click(function() {
		var checked_status = this.checked;
		
		var checkbox_name = this.name;
		$("input[name='chk[]']").each(function() {
			this.checked = checked_status;
			$.uniform.update();
		});
		if(checked_status==true){
			$("#btn-submit").prop('disabled', false);	
		}
		else{
			$("#btn-submit").prop('disabled', true);
		}	
		
	});
	$("input[name='chk[]']").click(function() {
		$("#mainchbx").attr('checked', false);
		var checked_status = this.checked;
		if(checked_status==true){
			$("#btn-submit").prop('disabled', false);	
		}
		else{
			$("#btn-submit").prop('disabled', true);
		}
	});
});
 
