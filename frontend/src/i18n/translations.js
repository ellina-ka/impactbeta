export const translations = {
  fr: {
    roles: {
      school_admin: 'Administrateur établissement',
      student: 'Étudiant',
      ngo_admin: 'Responsable ONG'
    },
    topbar: {
      school_admin_title: 'Tableau de bord administrateur',
      school_admin_subtitle: 'Suivi des demandes étudiantes, validations et conventions',
      student_title: 'Espace étudiant',
      student_subtitle: 'Déposez votre demande et suivez son avancement',
      ngo_admin_title: 'Espace ONG',
      ngo_admin_subtitle: 'Consultez les conventions et finalisez les signatures',
      role_selector_label: 'Rôle',
      demo_role_selector_label: 'Sélecteur de rôle démo',
      language_label: 'Langue',
      logout: 'Déconnexion'
    },
    sidebar: {
      dashboard: 'Tableau de bord',
      viewing_as: 'Vue actuelle : {role}'
    },
    workflow: {
      eyebrow: 'Parcours convention',
      timeline_label: 'Progression',
      steps: {
        submit: 'Soumettre',
        validate: 'Valider',
        generate: 'Générer',
        sign: 'Signer',
        complete: 'Terminer'
      }
    },
    admin: {
      hero: {
        title: 'Pilotez les conventions sans friction',
        subtitle: 'Une vue claire pour valider les demandes, générer les conventions et suivre les signatures.'
      },
      empty: {
        requests_title: 'La file de demandes est à jour',
        conventions_title: 'Aucune convention à signer'
      },
      kpis: {
        pending_requests: 'Demandes en attente',
        validated_requests: 'Demandes validées',
        generated_conventions: 'Conventions générées',
        total_planned_hours: 'Heures totales prévues'
      },
      sections: {
        student_requests: 'Demandes étudiantes',
        generated_conventions: 'Conventions générées',
        review_queue: 'File de revue',
        generated_packet: 'Dossier prêt'
      },
      table: {
        student: 'Étudiant',
        ngo: 'ONG',
        mission: 'Mission',
        dates: 'Période',
        hours: 'Heures',
        status: 'Statut',
        actions: 'Actions',
        no_requests: 'Aucune demande étudiante pour le moment.',
        no_conventions: 'Aucune convention générée pour le moment.'
      },
      conventions: {
        id_label: 'Référence'
      },
      actions: {
        view: 'Voir',
        validate: 'Valider',
        reject: 'Refuser'
      }
    },
    student: {
      hero: {
        title: 'Construisez votre parcours d’engagement',
        subtitle: 'Déposez votre mission, vérifiez les étapes et retrouvez votre convention dès validation.'
      },
      sections: {
        my_request: 'Ma demande',
        my_convention: 'Ma convention',
        start_here: 'Démarrer',
        progress: 'Suivi',
        generated_document: 'Document généré'
      },
      fields: {
        student_name: 'Nom de l’étudiant',
        student_email: 'Email étudiant',
        ngo_name: 'ONG / organisation',
        mission_description: 'Description de mission',
        target_hours: 'Heures prévues',
        start_date: 'Date de début',
        end_date: 'Date de fin'
      },
      actions: {
        submit_request: 'Soumettre la demande'
      },
      current_status: 'Statut actuel',
      empty: {
        title: 'Soumettez votre première demande',
        message: 'Renseignez votre mission et le tableau de suivi s’activera automatiquement.'
      },
      labels: {
        id: 'Identifiant',
        student: 'Étudiant',
        ngo: 'ONG',
        period: 'Période',
        target_hours: 'Heures prévues'
      },
      no_convention: 'Aucune convention générée pour le moment. Elle apparaîtra après validation administrateur.'
    },
    ngo: {
      hero: {
        title: 'Préparez les signatures ONG',
        subtitle: 'Retrouvez les conventions prêtes, vérifiez les informations et lancez la signature.',
        ready_label: 'Prêtes à signer'
      },
      sections: {
        signature_queue: 'File de signature'
      },
      empty: {
        title: 'Aucune action requise'
      },
      section_title: 'Conventions ONG',
      labels: {
        convention: 'Convention',
        student: 'Étudiant',
        mission: 'Mission',
        dates: 'Dates',
        target_hours: 'Heures prévues'
      },
      actions: {
        ready_to_sign: 'Marquer signée',
        signed: 'Signée'
      },
      no_conventions: 'Aucune convention disponible pour cette ONG.'
    },
    status: {
      pending: 'En attente',
      validated: 'Validée',
      rejected: 'Refusée',
      ready: 'Prête',
      draft: 'Brouillon',
      active: 'Active',
      signed: 'Signée'
    },
    common: {
      date_separator: '→',
      download_pdf: 'Télécharger PDF'
    }
  },
  en: {
    roles: {
      school_admin: 'School admin',
      student: 'Student',
      ngo_admin: 'NGO admin'
    },
    topbar: {
      school_admin_title: 'Administrator dashboard',
      school_admin_subtitle: 'Track student requests, approvals, and conventions',
      student_title: 'Student space',
      student_subtitle: 'Submit your request and track progress',
      ngo_admin_title: 'NGO space',
      ngo_admin_subtitle: 'Review conventions and complete signatures',
      role_selector_label: 'Role',
      demo_role_selector_label: 'Demo role switcher',
      language_label: 'Language',
      logout: 'Logout'
    },
    sidebar: {
      dashboard: 'Dashboard',
      viewing_as: 'Viewing as: {role}'
    },
    workflow: {
      eyebrow: 'Convention workflow',
      timeline_label: 'Progress',
      steps: {
        submit: 'Submit',
        validate: 'Validate',
        generate: 'Generate',
        sign: 'Sign',
        complete: 'Complete'
      }
    },
    admin: {
      hero: {
        title: 'Move conventions forward without friction',
        subtitle: 'A clear command center to approve requests, generate conventions, and track signatures.'
      },
      empty: {
        requests_title: 'The request queue is clear',
        conventions_title: 'No conventions are awaiting signature'
      },
      kpis: {
        pending_requests: 'Pending requests',
        validated_requests: 'Validated requests',
        generated_conventions: 'Generated conventions',
        total_planned_hours: 'Total planned hours'
      },
      sections: {
        student_requests: 'Student requests',
        generated_conventions: 'Generated conventions',
        review_queue: 'Review queue',
        generated_packet: 'Generated packet'
      },
      table: {
        student: 'Student',
        ngo: 'NGO',
        mission: 'Mission',
        dates: 'Period',
        hours: 'Hours',
        status: 'Status',
        actions: 'Actions',
        no_requests: 'No student requests at the moment.',
        no_conventions: 'No generated conventions at the moment.'
      },
      conventions: {
        id_label: 'Reference'
      },
      actions: {
        view: 'View',
        validate: 'Validate',
        reject: 'Reject'
      }
    },
    student: {
      hero: {
        title: 'Build your civic engagement pathway',
        subtitle: 'Submit your mission, review each step, and access your convention once approved.'
      },
      sections: {
        my_request: 'My request',
        my_convention: 'My convention',
        start_here: 'Start here',
        progress: 'Progress',
        generated_document: 'Generated document'
      },
      fields: {
        student_name: 'Student name',
        student_email: 'Student email',
        ngo_name: 'NGO / organization',
        mission_description: 'Mission description',
        target_hours: 'Target hours',
        start_date: 'Start date',
        end_date: 'End date'
      },
      actions: {
        submit_request: 'Submit request'
      },
      current_status: 'Current status',
      empty: {
        title: 'Submit your first request',
        message: 'Add your mission details and the progress tracker will activate automatically.'
      },
      labels: {
        id: 'ID',
        student: 'Student',
        ngo: 'NGO',
        period: 'Period',
        target_hours: 'Target hours'
      },
      no_convention: 'No convention generated yet. It will appear after admin validation.'
    },
    ngo: {
      hero: {
        title: 'Prepare NGO signatures',
        subtitle: 'Review ready conventions, confirm details, and move each packet to signature.',
        ready_label: 'Ready to sign'
      },
      sections: {
        signature_queue: 'Signature queue'
      },
      empty: {
        title: 'No action required'
      },
      section_title: 'NGO conventions',
      labels: {
        convention: 'Convention',
        student: 'Student',
        mission: 'Mission',
        dates: 'Dates',
        target_hours: 'Target hours'
      },
      actions: {
        ready_to_sign: 'Mark signed',
        signed: 'Signed'
      },
      no_conventions: 'No conventions available for this NGO.'
    },
    status: {
      pending: 'Pending',
      validated: 'Validated',
      rejected: 'Rejected',
      ready: 'Ready',
      draft: 'Draft',
      active: 'Active',
      signed: 'Signed'
    },
    common: {
      date_separator: '→',
      download_pdf: 'Download PDF'
    }
  }
};
