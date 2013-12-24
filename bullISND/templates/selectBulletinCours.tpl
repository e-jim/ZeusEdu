<div id="selecteur" class="noprint" style="clear:both">
	<form name="formSelecteur" id="formSelecteur" method="POST" action="index.php">
		Bulletin n° <select name="bulletin" id="bulletin">
		{section name=boucleBulletin start=1 loop=$nbBulletins+1}
			<option value="{$smarty.section.boucleBulletin.index}"
					{if isset($bulletin) && $smarty.section.boucleBulletin.index == $bulletin} selected="selected"{/if}>
				{$smarty.section.boucleBulletin.index}</option>
		{/section}
	</select>
	
	<select name="coursGrp" id="coursGrp">
		<option value="">Cours</option>
		{if isset($listeCours)}
		{foreach from=$listeCours key=unCoursGrp item=unCours}
			<option value="{$unCoursGrp}"{if isset($coursGrp) && ($unCoursGrp == $coursGrp)} selected{/if}>
				{$unCours.statut} {$unCours.nbheures}h - {$unCours.libelle} {$unCours.annee} ({$unCours.coursGrp})</option>
		{/foreach}
		{/if}
	</select>
	{if isset($tri)}Tri: {$tri}{/if}
	{* si un cours est sélectionné, on présente le bouton OK *}
	{if isset($coursGrp)}<input type="submit" value="OK" name="OK" id="envoi">{/if}
	<input type="hidden" name="action" value="{$action}">
	<input type="hidden" name="mode" value="{$mode}">
	<input type="hidden" name="tri" value="{$tri}">
	<input type="hidden" name="etape" value="showCotes">
	</form>
</div>

<script type="text/javascript">
{literal}
$(document).ready (function() {
	$("#formSelecteur").submit(function(){
		if ($("#coursGrp").val() == '')
			return false;
		else {
			$("#wait").show();
			$.blockUI();
			$("#corpsPage").hide();
			}
		})

	$("#coursGrp").change(function(){
	if ($(this).val() != '')
		$("#formSelecteur").submit()
		else $("#envoi").hide();
	})

	$("#bulletin").change(function(){
		if ($("#coursGrp").val() != '')
				$("#formSelecteur").submit();
				else $("#envoi").hide();
	})
})
{/literal}
</script>