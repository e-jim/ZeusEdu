<?php

class thot {

	/**
	 * renvoie la liste de toutes les connexions entre deux dates données
	 * @param $dateDebut (au format SQL)
	 * @param $dateFin (au format SQL)
	 * @return array
	 */
	public function listeConnexionsParDate($dateDebutSQL, $dateFinSQL) {
		$connexion = Application::connectPDO(SERVEUR, BASE, NOM, MDP);
		$sql = "SELECT logins.user, date, heure, ip, host, de.matricule, nom, prenom, groupe ";
		$sql .= "FROM ".PFX."thotLogins AS logins ";
		$sql .= "JOIN ".PFX."passwd AS dpw ON dpw.user = logins.user ";
		$sql .= "JOIN ".PFX."eleves AS de ON de.matricule = dpw.matricule ";
		$sql .= "WHERE date >= '$dateDebutSQL' AND date <= '$dateFinSQL' ";
		$sql .= "ORDER BY date, heure, logins.user ";
		$resultat = $connexion->query($sql);
		$liste = array();
		if ($resultat) {
			$resultat->setFetchMode(PDO::FETCH_ASSOC);
			while ($ligne = $resultat->fetch()) {
				$user = $ligne['user'];
				$date = Application::datePHP($ligne['date']);
				$ligne['date'] = $date;
				$liste[$user][]=$ligne;
				}
			}
		Application::deconnexionPDO($connexion);
		return $liste;
		}

	/**
	* renvoie la notification dont on fournit l'id ou une notification vide du type choisi
	* @param $id / Null : l'id de la notification dans la BD
	* @param $type : ecole, niveau, classe, eleve
	* @param $destinataire : pour quoi ou quel groupe
	* @return array
	*/
	public function newNotification ($type=Null,$proprio, $destinataire){
		if ($type != Null) {
			$notification = array(
				'id'=> Null,
				'dateDebut'=> Application::dateNow(),
				'dateFin'=> Application::dateUnAn(),
				'type'=> $type,
				'proprietaire'=> $proprio,
				'destinataire'=> $destinataire,
				'urgence'=> 0,
				'mail'=> 0,
				'accuse'=> 0
				);
			return $notification;
			}
	}

	/**
	* renvoie les détails d'une notification dont on fournit l'id dans la base de données
	* les détails sont renvoyés si l'utilisateur $acronyme est bien propriétaire de la notification
	* @param $id : l'id dans la BD
	* @param $acronyme: l'acronyme de l'utilisateur courant
	* @return array
	*/
	public function getNotification($id,$acronyme){
		$connexion = Application::connectPDO(SERVEUR, BASE, NOM, MDP);
		$sql = "SELECT id, type, proprietaire, objet, texte, dateDebut, dateFin, destinataire, urgence, mail, lu, accuseReception ";
		$sql .= "FROM ".PFX."thotNotifications ";
		$sql .= "WHERE id='$id' AND proprietaire = '$acronyme' ";
		$notification = array();
		$resultat = $connexion->query($sql);
		if ($resultat){
			$resultat->setFetchMode(PDO::FETCH_ASSOC);
			$notification = $resultat->fetch();
			$notification['dateDebut'] = Application::datePHP($notification['dateDebut']);
			$notification['dateFin'] = Application::datePHP($notification['dateFin']);
			}
		Application::deconnexionPDO($connexion);
		return $notification;
		}

	/**
	* suppression d'une notification dont on fournit l'id et le propriétaire (sécurité)
	* @param $id: id de la notification dans la BD
	* @param $acronyme : le propriétaire
	* @return nombre de suppression dans la BD (normalement 0)
	*/
	public function delNotification($id,$acronyme){
		$connexion = Application::connectPDO(SERVEUR, BASE, NOM, MDP);
		$sql = "DELETE FROM ".PFX."thotNotifications ";
		$sql .= "WHERE id='$id' AND proprietaire='$acronyme' ";
		$resultat = $connexion->exec($sql);
		Application::deconnexionPDO($connexion);
		return $resultat;
	}

	/**
	* suppression d'une série de notifications dont on fournit les id's et le propriétaire
	* @param $post : $_POST issu du formulaire de sélection
	* @param $acronyme : le propriétaire
	* @return nombre de suppressions
	*/
	public function delMultiNotifications($post,$acronyme){
		$listeIds = array();
		foreach ($post as $fieldName=>$value) {
			if (substr($fieldName,0,4) == 'del_')
				$listeIds[$value]=$value;
		}
		$listeIdsString = implode(',',$listeIds);
		$connexion = Application::connectPDO(SERVEUR, BASE, NOM, MDP);
		$sql = "DELETE FROM ".PFX."thotNotifications ";
		$sql .= "WHERE id IN ($listeIdsString) AND (proprietaire = '$acronyme') ";
		$resultat = $connexion->exec($sql);
		Application::deconnexionPDO($connexion);
		if ($resultat == '') $resultat=0;
		return $resultat;
	}

	/**
	 * enregistre une notification à attribuer à un élève ou à une classe
	 * @param $post : informations provenant du formulaire ad-hoc
	 * @return array
	 */
	public function enregistrerNotification($post){
		$id = $post['id'];
		$type = $post['type'];
		$destinataire = $post['destinataire'];
		$proprietaire = $post['proprietaire'];
		$objet = $post['objet'];
		$texte = $post['texte'];
		$urgence = $post['urgence'];
		$dateDebut = Application::dateMysql($post['dateDebut']);
		$dateFin = Application::dateMysql($post['dateFin']);
		$mail = isset($post['mail'])?1:0;
		$accuse = isset($post['accuse'])?1:0;

		$connexion = Application::connectPDO(SERVEUR, BASE, NOM, MDP);
		$texte = $connexion->quote($texte);
		$objet = $connexion->quote($objet);

		$sql = "INSERT INTO ".PFX."thotNotifications ";
		$sql .= "SET id='$id', type='$type', destinataire='$destinataire', proprietaire='$proprietaire', objet=$objet, texte=$texte, ";
		$sql .= "dateDebut='$dateDebut', dateFin='$dateFin', ";
		$sql .= "urgence='$urgence', mail='$mail', accuseReception='$accuse' ";
		$sql .= "ON DUPLICATE KEY UPDATE ";
		$sql .= "type='$type', destinataire='$destinataire', proprietaire='$proprietaire', objet=$objet, texte=$texte, ";
		$sql .= "dateDebut='$dateDebut', dateFin='$dateFin', ";
		$sql .= "urgence='$urgence', mail='$mail', accuseReception='$accuse' ";
		$resultat = $connexion->exec($sql);
		Application::deconnexionPDO($connexion);
		if ($resultat > 0)
			return $post;
			else return Null;
		}

	/**
	 * liste des notifications de l'utilisateur dont on fournit l'acronyme
	 * @param $acronyme
	 * @return array
	 */
	public function listeUserNotification($acronyme){
		$connexion = Application::connectPDO(SERVEUR, BASE, NOM, MDP);
		$sql = "SELECT id, type, objet, texte, urgence, destinataire, dateDebut, dateFin, mail, lu, accuseReception ";
		$sql .= "FROM ".PFX."thotNotifications ";
		$sql .= "WHERE proprietaire = '$acronyme' ";
		$sql .= "ORDER BY dateDebut, destinataire ";

		$resultat = $connexion->query($sql);
		$liste = array('ecole'=>array(), 'niveau'=>array(),'classes'=>array(), 'eleves'=>array());
		if ($resultat) {
			$resultat->setFetchMode(PDO::FETCH_ASSOC);
			while ($ligne = $resultat->fetch()) {
				$id = $ligne['id'];
				$type = $ligne['type'];
				$ligne['objet'] = stripslashes($ligne['objet']);
				$ligne['texte'] = strip_tags(stripslashes($ligne['texte']));
				$ligne['dateDebut'] = Application::datePHP($ligne['dateDebut']);
				$ligne['dateFin'] = Application::datePHP($ligne['dateFin']);
				$destinataire = $ligne['destinataire'];
				$liste[$type][$id] = $ligne;
				}
			}
		Application::deconnexionPDO($connexion);
		return $liste;
		}

	/**
	 * Ajout des notifications de conseils de classe de fin d'année
	 * @param $post : array
	 * @param $listeDecisions : array liste des décisions prises en délibé
	 * @param $listeEleves : liste des élèves de la classe par matricule (key)
	 * @param $acronyme: utilisateur responsable
	 * @return $liste : liste des matricules des élèves qui ont été notifiés
	 */
	public function notifier($post, $listeDecisions, $listeEleves, $acronyme) {
		$connexion = Application::connectPDO(SERVEUR, BASE, NOM, MDP);
		$dateDebut = Application::dateMysql(Application::dateNow());
		$dateFin = Application::dateMysql(Application::dateUnAn());
		$sql = "INSERT INTO ".PFX."thotNotifications ";
		$sql .= "SET type='eleves', proprietaire='$acronyme', destinataire=:matricule, objet='Décision du Conseil de Classe', ";
		$sql .= "texte=:texte, dateDebut='$dateDebut', dateFin='$dateFin', ";
		$sql .= "urgence='2', mail='1', lu='1', accuseReception='1' ";
		$requete = $connexion->prepare($sql);
		$liste = array();
		foreach ($listeEleves as $matricule=>$data)	{
			if (isset($post['conf_'.$matricule])) {
				// la notification est-elle souhaitée? Sinon, pas de notification dans la BD
				if (isset($post['notif_'.$matricule])) {
					$texte = $listeDecisions[$matricule]['texteDecision'];
					$notification = array(':matricule'=>$matricule, ':texte'=>$texte);
					$resultat = $requete->execute($notification);
					$liste[$matricule]=$matricule;
					}
				}
			}
		Application::deconnexionPDO($connexion);
		return $liste;
	}

	/**
	 * Envoi de mails de notification aux élèves de la liste
	 * @param $listeMailing liste des matricules (key) et des informations concernant les élèves
	 * @param $objet: objet du mail
	 * @param $texte: texte du mail
	 * @return array : la liste des matricules des élèves auxquels un mail a été envoyé
	 */
	public function mailer($listeMailing, $objet, $texte, $signature){
		require_once(INSTALL_DIR.'/phpMailer/class.phpmailer.php');
		$mail = new PHPmailer();
		$liste = array();
		foreach ($listeMailing as $matricule=>$data) {
			$liste[$matricule]=$matricule;
			$mail->IsHTML(true);
			$mail->CharSet = 'UTF-8';
			$mail->From = NOREPLY;
			$mail->FromName = NOMNOREPLY;

			$nomDestinataire = $data['nom'];
			$mailDestinataire = $data['adresseMail'];;
			$mail->ClearAddresses();
			$mail->AddAddress($mailDestinataire,$nomDestinataire);
			$mail->Subject=$objet;
			$mail->Body=$texte.$signature;
			$mail->Send();
		}
		return $liste;
	}

	/**
	 * observation des logins récents des élèves
	 * @param $nb: nombre de lignes demandées
	 * @return array
	 */
	public function lookLogins($min, $max) {
		$connexion = Application::connectPDO(SERVEUR, BASE, NOM, MDP);
		$sql = "SELECT classe, nom, prenom, user, date, heure, decision, restriction ";
		$sql .= "FROM ".PFX."thotLogins AS dtl ";
		$sql .= "JOIN ".PFX."eleves AS de ON de.matricule = SUBSTR(user,-4) ";
		$sql .= "LEFT JOIN ".PFX."bullDecisions AS dbd ON dbd.matricule = de.matricule ";
		$sql .= "ORDER BY date DESC, heure DESC ";
		$sql .= "LIMIT $min, $max ";

		$resultat = $connexion->query($sql);
		$liste = array();
		if ($resultat) {
			$resultat->setFetchMode(PDO::FETCH_ASSOC);
			while ($ligne = $resultat->fetch()) {
				$ligne['date'] = Application::datePHP($ligne['date']);
				$liste[] = $ligne;
				}
			}
		Application::deconnexionPDO($connexion);
		return $liste;
	}

	/**
	 * lecture des informations sur les limites d'accès aux bulletins (matricule de l'élève, numéro du bulletin) pour toutes les classes passées en argument
	 * @param $classe la classe concernée
	 * @return array
	 */
	public function listeBulletinsEleves($classe) {
		$connexion = Application::connectPDO(SERVEUR, BASE, NOM, MDP);
		$sql = "SELECT de.matricule, bulletin, nom, prenom ";
		$sql .= "FROM ".PFX."eleves AS de ";
		$sql .= "LEFT JOIN ".PFX."thotBulletin AS dtb ON de.matricule = dtb.matricule ";
		$sql .= "WHERE de.classe = '$classe' ";

		$resultat = $connexion->query($sql);
		$liste = array();
		if ($resultat) {
			$resultat->setFetchMode(PDO::FETCH_ASSOC);
			while ($ligne = $resultat->fetch()) {
				$matricule = $ligne['matricule'];
				$liste[$matricule] = $ligne;
				}
			}
		Application::deconnexionPDO($connexion);
		return $liste;
		}


	/**
	 * enregistre les limites de visibilité des bulletins par classe
	 * @param $post => issu du formulaire
	 * @return $nb: nombre d'enregistrements réussis
	 */
	public function saveLimiteBulletins($post) {
		$connexion = Application::connectPDO(SERVEUR, BASE, NOM, MDP);
		$sql = "INSERT INTO ".PFX."thotBulletin ";
		$sql .= "SET bulletin=:bulletin, matricule=:matricule ";
		$sql .= "ON DUPLICATE KEY UPDATE bulletin=:bulletin ";
		$requete = $connexion->prepare($sql);
		$nb = 0;
		foreach ($post as $fieldName=>$value) {
			if (SUBSTR($fieldName,0,9) == 'bulletin_') {
				$matricule = explode('_',$fieldName);
				$matricule = $matricule[1];
				$bulletin = $value;
				$data = array(':matricule'=>$matricule, ':bulletin'=>$bulletin);
				$resultat = $requete->execute($data);

				if ($resultat > 0)
				 	$nb++;
				}
		}
		Application::deconnexionPDO($connexion);
		return $nb;
		}

}
?>
