<!-- Notifications à un élève -->
<div class="tab-pane active hidden-print" id="tabs-1">
{assign var=liste value=$listeNotifications.eleves}
<table class="table table-condensed">
	<thead>
    <tr>
      <th colspan="5">
		{if $liste|@count > 0}
		<input type="checkbox" class="selectAll"> Sélectionner <i class="fa fa-arrow-left"></i>
		<button class="btn btn-warning delModal" type="button">
			<i class="fa fa-times text-danger"></i> Effacer
		</button>
		{else}
		Aucune notification à des élèves
		{/if}
		</th>
		<th style="width:1em" title="mail envoyé" data-container="body"><i class="fa fa-envelope fa-lg text-success"></i></th>
		<th style="width:1em" title="Accusé de lecture" data-container="body"><i class="fa fa-check fa-lg text-success"></i></th>
    </tr>
  </thead>
{foreach from=$liste item=uneNote}
	{assign var=matricule value=$uneNote.destinataire}
  <tr title="{$detailsEleves.$matricule.prenom} {$detailsEleves.$matricule.nom}: {$detailsEleves.$matricule.classe}"
      data-container="body">
    <td style="width:1em">
		<input type="checkbox" class="checkDelete" id="check{$uneNote.id}" data-id="{$uneNote.id}">
		</td>
	<td style="width:1em">
		<form class="microForm" method="POST" action="index.php" role="form">
			<button type="submit" class="btn btn-default btn-sm"><i class="fa fa-pencil-square-o fa-lg text-success editNote"></i></button>
			<input type="hidden" name="matricule" value="{$uneNote.destinataire}">
			<input type="hidden" name="id" value="{$uneNote.id}">
			<input type="hidden" name="onglet" class="onglet" value="{$onglet|default:0}">
			<input type="hidden" name="action" value="editNotification">
			<input type="hidden" name="mode" value="eleves">
			<input type="hidden" name="etape" value="show">
			<input type="hidden" name="onglet" class="onglet" value="{$onglet|default:0}">
		</form>
	</td>
	<td style="width:1em">
		<button type="button" class="btn btn-warning btn-delete" data-id="{$uneNote.id}"><i class="fa fa-times text-danger"></i></button>
	</td>
	<td>
		<h4 class="urgence{$uneNote.urgence}"><span class="dateDebut">{$uneNote.dateDebut}</span>: <span class="objet">{$uneNote.objet}</span></h4>
	</td>
	<td style="width:20%; text-align:right;">
		{$detailsEleves.$matricule.prenom} {$detailsEleves.$matricule.nom}: {$detailsEleves.$matricule.classe}
	</td>
	<td title="mail envoyé" data-container="body">{if $uneNote.mail == 1}<i class="fa fa-envelope fa-lg text-success"></i>{else}&nbsp;{/if}</td>
	<td title="Accusé de lecture" data-container="body">{if $uneNote.accuse == 1}<i class="fa fa-check fa-lg text-success"></i>{else}&nbsp;{/if}</td>
  </tr>
  <tr>
    <td colspan="7">
     <span class="texte">{$uneNote.texte|truncate:150:'...'}</span>
   </td>
  </tr>
{/foreach}
</table>
</div>
