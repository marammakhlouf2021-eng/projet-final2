require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { Groq } = require('groq-sdk');

// ─── Models ───────────────────────────────────────────────────────────────────
const Admin          = require('./models/admin');
const Professeur     = require('./models/professeur');
const Administration = require('./models/administration');
const Etudiant       = require('./models/etudiant');
const Classe         = require('./models/classe');
const Matiere        = require('./models/matiere');
const EmploiDuTemps  = require('./models/emploidutemps');
const Note           = require('./models/note');
const Absence        = require('./models/absence');
const DemandeCompte  = require('./models/demandecompte');
const Semestre       = require('./models/semestre');
const ResetToken     = require('./models/resettoken');

require('./config/connect');

const SALT_ROUNDS = 10;

// ─── App ──────────────────────────────────────────────────────────────────────
const app = express();
app.use(cors());
app.use(express.json());

// ─── Nodemailer ───────────────────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'marammakhlouf2004@gmail.com',
    pass: 'bbgxliropgrdllto'
  }
});

// ─── Groq AI ──────────────────────────────────────────────────────────────────
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// ─── Helper: envoyer lien reset ───────────────────────────────────────────────
async function envoyerLienReset(email, role, nom, prenom, res) {
  try {
    const token = crypto.randomBytes(32).toString('hex');
    const expiration = new Date(Date.now() + 60 * 60 * 1000);

    await ResetToken.deleteMany({ email, role });
    await new ResetToken({ email, role, token, expiration }).save();

    const lien = `http://localhost:4200/reset-password?token=${token}&role=${role}`;

    await transporter.sendMail({
      from: 'marammakhlouf2004@gmail.com',
      to: email,
      subject: 'Réinitialisation de votre mot de passe',
      html: `
        <h2>Bonjour ${nom} ${prenom} </h2>
        <p>Vous avez demandé la réinitialisation de votre mot de passe.</p>
        <a href="${lien}" style="display:inline-block;background:#4a3f6b;color:white;padding:12px 25px;border-radius:8px;text-decoration:none;font-size:16px;margin:15px 0;">
          Réinitialiser mon mot de passe
        </a>
        <p style="color:#999;font-size:12px;">Ce lien expire dans <strong>1 heure</strong>.<br>Si vous n'avez pas fait cette demande, ignorez cet email.</p>
      `
    });

    res.status(200).json({ message: "Lien de réinitialisation envoyé par email !" });
  } catch (err) {
    console.log('Erreur envoi email:', err);
    if (!res.headersSent) res.status(500).json({ message: "Erreur lors de l'envoi de l'email" });
  }
}

// ─── Test ─────────────────────────────────────────────────────────────────────
app.get('/api/test', (req, res) => res.json({ message: 'Connexion OK' }));

// ═══════════════════════════════════════════════════════════════════════════════
// CHATBOT
// ═══════════════════════════════════════════════════════════════════════════════
app.post('/chat', async (req, res) => {
  try {
    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: 'You are a helpful assistant for a university platform.' },
        { role: 'user', content: req.body.message }
      ],
      model: 'llama-3.3-70b-versatile'
    });
    res.json({ reply: completion.choices[0].message.content });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// CLASSES
// ═══════════════════════════════════════════════════════════════════════════════
// =============================
// ➕ AJOUTER CLASSE
// =============================
app.post('/add-classe', async (req, res) => {
  try {
    let { niveau, specialite, groupe } = req.body;

    if (!niveau || !groupe) {
      return res.status(400).json({ message: "Niveau et groupe obligatoires" });
    }

    groupe = groupe.charAt(0).toUpperCase();

    if (niveau === '1ere') {
      specialite = undefined;
    } else {
      if (!specialite) {
        return res.status(400).json({ message: "Spécialité obligatoire" });
      }
    }

    const niveauNum = niveau.replace('ere','').replace('eme','');
    const spec = specialite ? specialite.substring(0,4) : '';
    const nom = `${niveauNum} ${spec} ${groupe}`.trim();

    const data = {
      nom,
      niveau,
      groupe
    };

    if (specialite) {
      data.specialite = specialite;
    }

    const classe = new Classe(data);
    await classe.save();

    res.status(200).json(classe);

  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});
// =============================
// 📥 GET CLASSES
// =============================
app.get('/get-classes', async (req, res) => {
  try {
    const classes = await Classe.find().sort({ niveau: 1, groupe: 1 });
    res.status(200).json(classes);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});


// =============================
// ✏️ UPDATE CLASSE
// =============================
app.put('/update-classe/:id', async (req, res) => {
  try {
    let { niveau, specialite, groupe } = req.body;

    // 🔥 Formater groupe
    groupe = groupe.toString().charAt(0).toUpperCase();

    // 🔥 Si 1ère → supprimer spécialité
    if (niveau === '1ere') {
      specialite = '';
    }

    // 🔥 Re-générer nom
    const niveauNum = niveau.replace('ere', '').replace('eme', '');
    const spec = specialite ? specialite.substring(0, 4) : '';
    const nomFinal = `${niveauNum} ${spec} ${groupe}`.trim();

    const updated = await Classe.findByIdAndUpdate(
      req.params.id,
      {
        nom: nomFinal,
        niveau,
        specialite: specialite || '',
        groupe
      },
      { new: true }
    );

    res.status(200).json(updated);

  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});


// =============================
// ❌ DELETE CLASSE
// =============================
app.delete('/delete-classe/:id', async (req, res) => {
  try {
    const deleted = await Classe.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "Classe introuvable" });
    }

    res.status(200).json({ message: "Classe supprimée" });

  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ============================================================================
// MATIERES - Routes complètes
// ============================================================================

// Ajouter une matière (avec profsAutorises)
app.post('/add-matiere', async (req, res) => {
  try {
    const { nom, profsAutorises, pourcentages } = req.body;

    if (!nom) {
      return res.status(400).json({ message: "Nom obligatoire" });
    }

    const matiere = new Matiere({
      nom: nom.toLowerCase().trim(),
      profsAutorises: profsAutorises || [],
      classes: [],
      pourcentages
    });

    await matiere.save();
    res.status(200).json(matiere);

  } catch (err) {
    res.status(400).json(err);
  }
});
// Supprimer une matière
app.delete('/delete-matiere/:id', async (req, res) => {
  try {
    const matiereId = req.params.id;

    // Supprimer les notes de cette matière
    await Note.deleteMany({ matiere: matiereId });

    // Supprimer les absences de cette matière
    await Absence.deleteMany({ matiere: matiereId });

    // Supprimer les séances d'emploi du temps de cette matière
    await EmploiDuTemps.deleteMany({ matiere: matiereId });

    // Retirer la matière de matieresAutorisees de tous les professeurs
    await Professeur.updateMany(
      { matieresAutorisees: matiereId },
      { $pull: { matieresAutorisees: matiereId } }
    );

    // Retirer la matière de toutes les classes qui l'ont dans leur liste
    await Matiere.updateMany(
      { 'classes.classe': { $exists: true } },
      { $pull: { classes: { classe: matiereId } } }
    );

    // Supprimer la matière
    const deleted = await Matiere.findByIdAndDelete(matiereId);
    if (!deleted) return res.status(404).json({ message: "Matière introuvable" });

    res.status(200).json({ message: "Matière et toutes ses données supprimées" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Récupérer toutes les matières avec profs autorisés et classes peuplés
app.get('/get-matieres', (req, res) => {
  Matiere.find()
    .populate('classes.classe')
    .populate('classes.profId')
    .populate('profsAutorises')
    .then(data => res.status(200).send(data))
    .catch(err => res.status(400).send(err));
});

// Récupérer matières par classe avec profs autorisés peuplés
app.get('/get-matieres-by-classe/:classeId', (req, res) => {
  Matiere.find({ 'classes.classe': req.params.classeId })
    .populate('classes.classe')
    .populate('profsAutorises')
    .then(data => res.status(200).send(data))
    .catch(err => res.status(400).send(err));
});

// Mettre à jour une matière
app.put('/update-matiere/:id', async (req, res) => {
  try {
    const updated = await Matiere.findByIdAndUpdate(
      req.params.id,
      {
        nom: req.body.nom?.toLowerCase(),
        profsAutorises: req.body.profsAutorises,
        pourcentages: req.body.pourcentages
      },
      { new: true }
    ).populate('profsAutorises').populate('classes.classe');

    res.status(200).send(updated);
  } catch (err) {
    res.status(400).send(err);
  }
});

// Mettre à jour seulement les profs autorisés
app.put('/update-profs-autorises/:id', async (req, res) => {
  try {
    const updated = await Matiere.findByIdAndUpdate(
      req.params.id,
      { profsAutorises: req.body.profsAutorises },
      { new: true }
    ).populate('profsAutorises');

    res.status(200).send(updated);
  } catch (err) {
    res.status(400).send(err);
  }
});
// Vérifier si email existe dans toutes les collections
app.post('/verifier-email', async (req, res) => {
  try {
    const { email } = req.body;
    const [prof, adm, etu, admin] = await Promise.all([
      Professeur.findOne({ email }),
      Administration.findOne({ email }),
      Etudiant.findOne({ email }),
      Admin.findOne({ email })
    ]);
    res.status(200).json({ existe: !!(prof || adm || etu || admin) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Inviter un professeur par email (sans mot de passe, il crée son compte)
app.post('/inviter-professeur', async (req, res) => {
  try {
    const { email, matieresAutorisees } = req.body;

    // Vérifier dans toutes les collections avec les bons noms
    const [profExist, admExist, etuExist, adminExist] = await Promise.all([
      Professeur.findOne({ email }),
      Administration.findOne({ email }),
      Etudiant.findOne({ email }),
      Admin.findOne({ email })
    ]);

    if (profExist || admExist || etuExist || adminExist) {
      return res.status(400).json({ message: "Cet email est déjà utilisé dans le système" });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiration = new Date(Date.now() + 48 * 60 * 60 * 1000);

    await ResetToken.deleteMany({ email, role: 'invitation' });
    await new ResetToken({ email, role: 'invitation', token, expiration }).save();

    const lien = `http://localhost:4200/creer-compte?token=${token}&email=${encodeURIComponent(email)}&role=Professeur`;

    await transporter.sendMail({
      from: 'marammakhlouf2004@gmail.com',
      to: email,
      subject: 'Invitation à rejoindre la plateforme',
      html: `
        <h2>Bonjour,</h2>
        <p>Vous avez été invité à rejoindre la plateforme en tant que <strong>Professeur</strong>.</p>
        <p>Cliquez sur le bouton ci-dessous pour créer votre compte :</p>
        <a href="${lien}" style="display:inline-block;background:#4a3f6b;color:white;padding:12px 25px;border-radius:8px;text-decoration:none;font-size:16px;margin:15px 0;">
          Créer mon compte
        </a>
        <p style="color:#999;font-size:12px;">Ce lien expire dans <strong>48 heures</strong>.</p>
      `
    });

    // Ne pas créer le professeur maintenant — il sera créé quand il complète son profil
    res.status(200).json({ message: "Invitation envoyée !" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});



// Ajouter une classe à une matière
app.put('/add-classe-to-matiere/:matiereId', async (req, res) => {
  try {
    const { classeId, coefficient } = req.body;
    const matiere = await Matiere.findById(req.params.matiereId);
    if (!matiere) return res.status(404).json({ message: "Matière introuvable" });

    const exists = matiere.classes.some(c => c.classe.toString() === classeId);
    if (exists) {
      return res.status(400).json({ message: "Cette matière est déjà assignée à cette classe" });
    }

    matiere.classes.push({ classe: classeId, coefficient: coefficient || 1 });
    await matiere.save();
    res.status(200).json({ message: "Classe ajoutée à la matière !" });
  } catch (err) {
    res.status(400).send(err);
  }
});

// Retirer une classe d'une matière
app.put('/remove-classe-from-matiere/:matiereId', async (req, res) => {
  try {
    const { classeId } = req.body;
    await Matiere.findByIdAndUpdate(
      req.params.matiereId,
      { $pull: { classes: { classe: classeId } } },
      { new: true }
    );
    res.status(200).json({ message: "Classe retirée de la matière !" });
  } catch (err) {
    res.status(400).send(err);
  }
});
app.put('/update-matiere-classe/:matiereId', async (req, res) => {
  try {
    const { classeId, coefficient, profId } = req.body;

    const matiere = await Matiere.findById(req.params.matiereId);
    if (!matiere) return res.status(404).json({ message: "Matière introuvable" });

    const entry = matiere.classes.find(c => c.classe.toString() === classeId);
    if (!entry) return res.status(404).json({ message: "Classe non trouvée dans cette matière" });

    entry.coefficient = coefficient;
    entry.profId = profId || null;

    await matiere.save();
    res.status(200).json({ message: "Matière mise à jour !" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
app.put('/update-matieres-autorisees/:id', async (req, res) => {
  try {
    const updated = await Professeur.findByIdAndUpdate(
      req.params.id,
      { matieresAutorisees: req.body.matieresAutorisees },
      { new: true }
    );
    res.status(200).send(updated);
  } catch (err) {
    res.status(400).send(err);
  }
});
// get-matieres-by-classe : filtrer par classes.classe
app.get('/get-matieres-by-classe/:classeId', (req, res) => {
  Matiere.find({ 'classes.classe': req.params.classeId })
    .populate('classes.classe')
    .populate('classes.profId')
    .populate('profsAutorises')
    .then(data => res.status(200).send(data))
    .catch(err => res.status(400).send(err));
});

// Ajouter une matière à une classe existante
app.put('/add-classe-to-matiere/:matiereId', async (req, res) => {
  try {
    const { classeId, coefficient } = req.body;
    const matiere = await Matiere.findById(req.params.matiereId);
    if (!matiere) return res.status(404).json({ message: "Matière introuvable" });

    // Vérifier si la classe est déjà ajoutée
    const exists = matiere.classes.some(c => c.classe.toString() === classeId);
    if (exists) return res.status(400).json({ message: "Cette matière est déjà assignée à cette classe" });

    matiere.classes.push({ classe: classeId, coefficient: coefficient || 1 });
    await matiere.save();
    res.status(200).json({ message: "Classe ajoutée à la matière !" });
  } catch (err) {
    res.status(400).send(err);
  }
});

// Supprimer une classe d'une matière
app.put('/remove-classe-from-matiere/:matiereId', async (req, res) => {
  try {
    const { classeId } = req.body;
    await Matiere.findByIdAndUpdate(
      req.params.matiereId,
      { $pull: { classes: { classe: classeId } } },
      { new: true }
    );
    res.status(200).json({ message: "Classe retirée de la matière !" });
  } catch (err) {
    res.status(400).send(err);
  }
});

// Vérifier si classe existe déjà
app.post('/check-classe', async (req, res) => {
  try {
    const { nom, niveau, specialite, groupe } = req.body;
    const existing = await Classe.findOne({ nom, niveau, specialite, groupe });
    res.status(200).json({ exists: !!existing });
  } catch (err) {
    res.status(400).send(err);
  }
});



// ═══════════════════════════════════════════════════════════════════════════════
// PROFESSEURS
// ═══════════════════════════════════════════════════════════════════════════════
app.post('/add-professeur', async (req, res) => {
  try {
    const passwordCrypte = await bcrypt.hash(req.body.password, SALT_ROUNDS);
    const prof = await new Professeur({ ...req.body, password: passwordCrypte }).save();

    await transporter.sendMail({
      from: 'marammakhlouf2004@gmail.com',
      to: req.body.email,
      subject: 'Votre compte Professeur a été créé',
      html: `
        <h2>Bonjour ${req.body.nom} ${req.body.prenom} </h2>
        <p>Votre compte professeur a été créé avec succès.</p>
        <p><strong>Email :</strong> ${req.body.email}</p>
        <p><strong>Mot de passe :</strong> ${req.body.password}</p>
        <p>Connectez-vous sur votre espace professeur.</p>
      `
    });

    res.status(200).send(prof);
  } catch (err) {
    res.status(400).send(err);
  }
});

app.get('/get-professeurs', async (req, res) => {
  try {
    const professeurs = await Professeur.find();

    console.log("Professeurs récupérés :", professeurs); // debug

    res.status(200).json(professeurs);

  } catch (err) {
    console.error("Erreur get-professeurs :", err);
    res.status(500).json({ message: err.message });
  }
});

app.put('/update-professeur/:id', async (req, res) => {
  try {
    const updated = await Professeur.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).send(updated);
  } catch (err) {
    res.status(400).send(err);
  }
});


app.delete('/delete-professeur/:id', async (req, res) => {
  try {
    const profId = req.params.id;

    const prof = await Professeur.findById(profId);

    // Supprimer les notes saisies par ce prof
    await Note.deleteMany({ saisirPar: profId });

    // Supprimer les absences saisies par ce prof
    await Absence.deleteMany({ saisirPar: profId });

    // Supprimer les séances d'emploi du temps de ce prof
    await EmploiDuTemps.deleteMany({ professeur: profId });

    // Retirer ce prof des profsAutorises de toutes les matières
    await Matiere.updateMany(
      { profsAutorises: profId },
      { $pull: { profsAutorises: profId } }
    );

    // Retirer ce prof des profId dans les classes des matières
    await Matiere.updateMany(
      { 'classes.profId': profId },
      { $set: { 'classes.$[elem].profId': null } },
      { arrayFilters: [{ 'elem.profId': profId }] }
    );

    // Supprimer le token de reset
    if (prof) {
      await ResetToken.deleteMany({ email: prof.email });
    }

    // Supprimer le professeur
    const deleted = await Professeur.findByIdAndDelete(profId);
    if (!deleted) return res.status(404).json({ message: "Professeur introuvable" });

    res.status(200).json({ message: "Professeur et toutes ses données supprimés" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


app.post('/login-professeur', async (req, res) => {
  try {
    const prof = await Professeur.findOne({ email: req.body.email });
    if (!prof) return res.status(401).json({ message: "Professeur introuvable" });
    const ok = await bcrypt.compare(req.body.password, prof.password);
    if (!ok) return res.status(401).json({ message: "Mot de passe incorrect" });
    res.status(200).json({ message: "Connexion réussie", professeur: prof });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err });
  }
});

app.post('/forgot-password-professeur', async (req, res) => {
  try {
    const prof = await Professeur.findOne({ email: req.body.email });
    if (!prof) return res.status(404).json({ message: "Email introuvable" });
    await envoyerLienReset(req.body.email, 'professeur', prof.nom, prof.prenom, res);
  } catch (err) {
    if (!res.headersSent) res.status(500).json({ message: "Erreur serveur" });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// ADMINISTRATION
// ═══════════════════════════════════════════════════════════════════════════════
app.post('/add-administration', async (req, res) => {
  try {
    const passwordCrypte = await bcrypt.hash(req.body.password, SALT_ROUNDS);
    const admi = await new Administration({ ...req.body, password: passwordCrypte }).save();

    await transporter.sendMail({
      from: 'marammakhlouf2004@gmail.com',
      to: req.body.email,
      subject: 'Votre compte Administration a été créé',
      html: `
        <h2>Bonjour ${req.body.nom} ${req.body.prenom} </h2>
        <p>Votre compte administration a été créé avec succès.</p>
        <p><strong>Email :</strong> ${req.body.email}</p>
        <p><strong>Mot de passe :</strong> ${req.body.password}</p>
        <p>Connectez-vous sur votre espace administration.</p>
      `
    });

    res.status(200).send(admi);
  } catch (err) {
    res.status(400).send(err);
  }
});

app.get('/get-administrations', (req, res) => {
  Administration.find()
    .then(data => res.status(200).send(data))
    .catch(err => res.status(400).send(err));
});

app.put('/update-administration/:id', (req, res) => {
  Administration.findByIdAndUpdate(req.params.id, req.body, { new: true })
    .then(updated => res.status(200).send(updated))
    .catch(err => res.status(400).send(err));
});

app.delete('/delete-administration/:id', async (req, res) => {
  try {
    const admId = req.params.id;

    const adm = await Administration.findById(admId);

    // Supprimer le token de reset
    if (adm) {
      await ResetToken.deleteMany({ email: adm.email });
    }

    // Supprimer l'administration
    const deleted = await Administration.findByIdAndDelete(admId);
    if (!deleted) return res.status(404).json({ message: "Administration introuvable" });

    res.status(200).json({ message: "Administration supprimée" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/login-administration', async (req, res) => {
  try {
    const adm = await Administration.findOne({ email: req.body.email });
    if (!adm) return res.status(401).json({ message: "Utilisateur introuvable" });
    const ok = await bcrypt.compare(req.body.password, adm.password);
    if (!ok) return res.status(401).json({ message: "Mot de passe incorrect" });
    res.status(200).json({ message: "Connexion réussie", administration: adm });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err });
  }
});

app.post('/forgot-password-administration', async (req, res) => {
  try {
    const adm = await Administration.findOne({ email: req.body.email });
    if (!adm) return res.status(404).json({ message: "Email introuvable" });
    await envoyerLienReset(req.body.email, 'administration', adm.nom, adm.prenom, res);
  } catch (err) {
    if (!res.headersSent) res.status(500).json({ message: "Erreur serveur" });
  }
});
app.post('/inviter-administration', async (req, res) => {
  try {
    const { email } = req.body;

    const [profExist, admExist, etuExist, adminExist] = await Promise.all([
      Professeur.findOne({ email }),
      Administration.findOne({ email }),
      Etudiant.findOne({ email }),
      Admin.findOne({ email })
    ]);

    if (profExist || admExist || etuExist || adminExist) {
      return res.status(400).json({ message: "Cet email est déjà utilisé dans le système" });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiration = new Date(Date.now() + 48 * 60 * 60 * 1000);

    await ResetToken.deleteMany({ email, role: 'invitation-administration' });
    await new ResetToken({ email, role: 'invitation-administration', token, expiration }).save();

    const lien = `http://localhost:4200/creer-compte?token=${token}&email=${encodeURIComponent(email)}&role=Administration`;

    await transporter.sendMail({
      from: 'marammakhlouf2004@gmail.com',
      to: email,
      subject: 'Invitation à rejoindre la plateforme',
      html: `
        <h2>Bonjour,</h2>
        <p>Vous avez été invité à rejoindre la plateforme en tant que <strong>Administration</strong>.</p>
        <a href="${lien}" style="display:inline-block;background:#4a3f6b;color:white;padding:12px 25px;border-radius:8px;text-decoration:none;font-size:16px;margin:15px 0;">
          Créer mon compte
        </a>
        <p style="color:#999;font-size:12px;">Ce lien expire dans <strong>48 heures</strong>.</p>
      `
    });

    res.status(200).json({ message: "Invitation envoyée !" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// ETUDIANTS
// ═══════════════════════════════════════════════════════════════════════════════
app.post('/add-etudiant', async (req, res) => {
  try {
    const passwordCrypte = await bcrypt.hash(req.body.password, SALT_ROUNDS);
    const etu = await new Etudiant({ ...req.body, password: passwordCrypte }).save();

    await transporter.sendMail({
      from: 'marammakhlouf2004@gmail.com',
      to: req.body.email,
      subject: 'Votre compte Étudiant a été créé',
      html: `
        <h2>Bonjour ${req.body.nom} ${req.body.prenom} </h2>
        <p>Votre compte étudiant a été créé avec succès.</p>
        <p><strong>Email :</strong> ${req.body.email}</p>
        <p><strong>Mot de passe :</strong> ${req.body.password}</p>
        <p>Connectez-vous sur votre espace étudiant.</p>
      `
    });

    res.status(200).send(etu);
  } catch (err) {
    res.status(400).send(err);
  }
});

app.get('/get-etudiants', (req, res) => {
  Etudiant.find().populate('classe')
    .then(data => res.status(200).send(data))
    .catch(err => res.status(400).send(err));
});

app.put('/update-etudiant/:id', (req, res) => {
  Etudiant.findByIdAndUpdate(req.params.id, req.body, { new: true })
    .then(updated => res.status(200).send(updated))
    .catch(err => res.status(400).send(err));
});

app.put('/affecter-etudiant-classe/:id', (req, res) => {
  Etudiant.findByIdAndUpdate(req.params.id, { classe: req.body.classe }, { new: true })
    .then(updated => res.status(200).send(updated))
    .catch(err => res.status(400).send(err));
});

app.delete('/delete-etudiant/:id', async (req, res) => {
  try {
    const etudiantId = req.params.id;

    // Supprimer les notes
    await Note.deleteMany({ etudiant: etudiantId });

    // Supprimer les absences
    await Absence.deleteMany({ etudiant: etudiantId });

    // Supprimer le token de reset s'il existe
    const etudiant = await Etudiant.findById(etudiantId);
    if (etudiant) {
      await ResetToken.deleteMany({ email: etudiant.email });
    }

    // Supprimer l'étudiant
    const deleted = await Etudiant.findByIdAndDelete(etudiantId);
    if (!deleted) return res.status(404).json({ message: "Étudiant introuvable" });

    res.status(200).json({ message: "Étudiant et toutes ses données supprimés" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
app.post('/login-etudiant', async (req, res) => {
  try {
    const etu = await Etudiant.findOne({ email: req.body.email }).populate('classe');
    if (!etu) return res.status(401).json({ message: "Étudiant introuvable" });
    const ok = await bcrypt.compare(req.body.password, etu.password);
    if (!ok) return res.status(401).json({ message: "Mot de passe incorrect" });
    res.status(200).json({ message: "Connexion réussie", etudiant: etu });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err });
  }
});

app.post('/forgot-password-etudiant', async (req, res) => {
  try {
    const etu = await Etudiant.findOne({ email: req.body.email });
    if (!etu) return res.status(404).json({ message: "Email introuvable" });
    await envoyerLienReset(req.body.email, 'etudiant', etu.nom, etu.prenom, res);
  } catch (err) {
    if (!res.headersSent) res.status(500).json({ message: "Erreur serveur" });
  }
});

app.get('/get-notes-by-etudiant/:etudiantId', async (req, res) => {
  try {
    const notes = await Note.find({ etudiant: req.params.etudiantId }).populate('matiere');
    res.status(200).send(notes);
  } catch (err) {
    res.status(400).send(err);
  }
});

app.get('/get-absences-by-etudiant/:etudiantId', async (req, res) => {
  try {
    const absences = await Absence.find({ etudiant: req.params.etudiantId }).populate('matiere');
    res.status(200).send(absences);
  } catch (err) {
    res.status(400).send(err);
  }
});
app.post('/inviter-etudiant', async (req, res) => {
  try {
    const { email, classe } = req.body;

    const [profExist, admExist, etuExist, adminExist] = await Promise.all([
      Professeur.findOne({ email }),
      Administration.findOne({ email }),
      Etudiant.findOne({ email }),
      Admin.findOne({ email })
    ]);

    if (profExist || admExist || etuExist || adminExist) {
      return res.status(400).json({ message: "Cet email est déjà utilisé dans le système" });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiration = new Date(Date.now() + 48 * 60 * 60 * 1000);

    await ResetToken.deleteMany({ email, role: 'invitation-etudiant' });
    await new ResetToken({ email, role: 'invitation-etudiant', token, expiration, classe }).save();

    const lien = `http://localhost:4200/creer-compte?token=${token}&email=${encodeURIComponent(email)}&role=Etudiant`;

    await transporter.sendMail({
      from: 'marammakhlouf2004@gmail.com',
      to: email,
      subject: 'Invitation à rejoindre la plateforme',
      html: `
        <h2>Bonjour,</h2>
        <p>Vous avez été invité à rejoindre la plateforme en tant qu'<strong>Étudiant</strong>.</p>
        <p>Cliquez sur le bouton ci-dessous pour créer votre compte :</p>
        <a href="${lien}" style="display:inline-block;background:#4a3f6b;color:white;padding:12px 25px;border-radius:8px;text-decoration:none;font-size:16px;margin:15px 0;">
          Créer mon compte
        </a>
        <p style="color:#999;font-size:12px;">Ce lien expire dans <strong>48 heures</strong>.</p>
      `
    });

    res.status(200).json({ message: "Invitation envoyée !" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// ADMIN
// ═══════════════════════════════════════════════════════════════════════════════
app.post('/add-admin', (req, res) => {
  new Admin(req.body).save()
    .then(saved => res.status(200).send(saved))
    .catch(err => res.status(400).send(err));
});

app.post('/login', async (req, res) => {
  try {
    const user = await Admin.findOne({ email: req.body.email });
    if (!user) return res.status(401).json({ message: "Utilisateur introuvable" });
    const ok = await bcrypt.compare(req.body.password, user.password);
    if (!ok) return res.status(401).json({ message: "Mot de passe incorrect" });
    res.status(200).json({ message: "Connexion réussie", user });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err });
  }
});

app.post('/forgot-password-admin', async (req, res) => {
  try {
    const admin = await Admin.findOne({ email: req.body.email });
    if (!admin) return res.status(404).json({ message: "Email introuvable" });
    await envoyerLienReset(req.body.email, 'admin', admin.nom || 'Admin', '', res);
  } catch (err) {
    if (!res.headersSent) res.status(500).json({ message: "Erreur serveur" });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// RESET PASSWORD
// ═══════════════════════════════════════════════════════════════════════════════
app.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    const resetToken = await ResetToken.findOne({ token });
    if (!resetToken) return res.status(400).json({ message: "Token invalide" });
    if (resetToken.expiration < new Date()) {
      await ResetToken.deleteOne({ token });
      return res.status(400).json({ message: "Token expiré" });
    }

    const passwordCrypte = await bcrypt.hash(newPassword, SALT_ROUNDS);
    const models = {
      professeur: Professeur,
      etudiant: Etudiant,
      administration: Administration,
      admin: Admin
    };
    const Model = models[resetToken.role];
    if (Model) await Model.findOneAndUpdate({ email: resetToken.email }, { password: passwordCrypte });

    await ResetToken.deleteOne({ token });
    res.status(200).json({ message: "Mot de passe réinitialisé avec succès !" });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// EMPLOI DU TEMPS
// ═══════════════════════════════════════════════════════════════════════════════
app.post('/add-emploi', async (req, res) => {
  try {
    const { classe, professeur, jour, heureDebut, heureFin, salle } = req.body;
    const overlap = { heureDebut: { $lt: heureFin }, heureFin: { $gt: heureDebut } };

    const conflitClasse = await EmploiDuTemps.findOne({ classe, jour, ...overlap });
    if (conflitClasse) return res.status(400).json({
      message: `Cette classe a déjà une séance le ${jour} de ${conflitClasse.heureDebut} à ${conflitClasse.heureFin}`
    });

    const conflitProf = await EmploiDuTemps.findOne({ professeur, jour, ...overlap });
    if (conflitProf) return res.status(400).json({
      message: `Ce professeur a déjà une séance le ${jour} de ${conflitProf.heureDebut} à ${conflitProf.heureFin}`
    });

    if (salle) {
      const conflitSalle = await EmploiDuTemps.findOne({ salle, jour, ...overlap }).populate('classe');
      if (conflitSalle) return res.status(400).json({
        message: `La salle ${salle} est déjà occupée le ${jour} de ${conflitSalle.heureDebut} à ${conflitSalle.heureFin} par la classe ${conflitSalle.classe?.nom}`
      });
    }

    const saved = await new EmploiDuTemps(req.body).save();
    res.status(200).send(saved);
  } catch (err) {
    res.status(400).send(err);
  }
});

app.get('/get-emploi-by-classe/:classeId', async (req, res) => {
  try {
    const emplois = await EmploiDuTemps.find({ classe: req.params.classeId })
      .populate('matiere').populate('professeur');
    res.status(200).send(emplois);
  } catch (err) {
    res.status(400).send(err);
  }
});

app.get('/get-emploi-by-professeur/:profId', async (req, res) => {
  try {
    const emplois = await EmploiDuTemps.find({ professeur: req.params.profId })
      .populate('matiere').populate('classe');
    res.status(200).json(emplois);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err });
  }
});

app.delete('/delete-emploi/:id', async (req, res) => {
  try {
    const deleted = await EmploiDuTemps.findByIdAndDelete(req.params.id);
    res.status(200).send(deleted);
  } catch (err) {
    res.status(400).send(err);
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// NOTES
// ═══════════════════════════════════════════════════════════════════════════════
app.post('/add-note', async (req, res) => {
  try {
    const saved = await new Note(req.body).save();
    res.status(200).send(saved);
  } catch (err) {
    res.status(400).send(err);
  }
});

app.get('/get-notes-by-matiere/:matiereId', async (req, res) => {
  try {
    const notes = await Note.find({ matiere: req.params.matiereId }).populate('etudiant');
    res.status(200).send(notes);
  } catch (err) {
    res.status(400).send(err);
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// ABSENCES
// ═══════════════════════════════════════════════════════════════════════════════
app.post('/add-absence', async (req, res) => {
  try {
    const dateQuery = {
      $gte: new Date(req.body.date),
      $lt: new Date(new Date(req.body.date).getTime() + 24 * 60 * 60 * 1000)
    };
    const existante = await Absence.findOne({ etudiant: req.body.etudiant, matiere: req.body.matiere, date: dateQuery });
    if (existante) {
      const updated = await Absence.findByIdAndUpdate(existante._id, req.body, { new: true });
      return res.status(200).send(updated);
    }
    const saved = await new Absence(req.body).save();
    res.status(200).send(saved);
  } catch (err) {
    res.status(400).send(err);
  }
});

app.get('/get-absences-by-matiere/:matiereId', async (req, res) => {
  try {
    const absences = await Absence.find({ matiere: req.params.matiereId }).populate('etudiant');
    res.status(200).send(absences);
  } catch (err) {
    res.status(400).send(err);
  }
});

app.get('/get-absences-by-seance/:matiereId/:date', async (req, res) => {
  try {
    const absences = await Absence.find({
      matiere: req.params.matiereId,
      date: {
        $gte: new Date(req.params.date),
        $lt: new Date(new Date(req.params.date).getTime() + 24 * 60 * 60 * 1000)
      }
    }).populate('etudiant');
    res.status(200).send(absences);
  } catch (err) {
    res.status(400).send(err);
  }
});

app.get('/get-absences-by-classe/:classeId/:date', async (req, res) => {
  try {
    const etudiants = await Etudiant.find({ classe: req.params.classeId });
    const etudiantIds = etudiants.map(e => e._id);
    const absences = await Absence.find({
      etudiant: { $in: etudiantIds },
      date: {
        $gte: new Date(req.params.date),
        $lt: new Date(new Date(req.params.date).getTime() + 24 * 60 * 60 * 1000)
      }
    }).populate('etudiant').populate('matiere');
    res.status(200).send(absences);
  } catch (err) {
    res.status(400).send(err);
  }
});

app.put('/update-absence/:id', async (req, res) => {
  try {
    const updated = await Absence.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).send(updated);
  } catch (err) {
    res.status(400).send(err);
  }
});

app.delete('/delete-absence/:id', async (req, res) => {
  try {
    const deleted = await Absence.findByIdAndDelete(req.params.id);
    res.status(200).send(deleted);
  } catch (err) {
    res.status(400).send(err);
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// DEMANDES DE COMPTES
// ═══════════════════════════════════════════════════════════════════════════════
app.post('/add-demande', async (req, res) => {
  try {
    const saved = await new DemandeCompte({
      ...req.body,
      statut: 'en_attente'
    }).save();
    res.status(200).send(saved);
  } catch (err) {
    res.status(400).send(err);
  }
});
app.put('/accepter-demande-force/:id', async (req, res) => {
  try {
    const demande = await DemandeCompte.findById(req.params.id);
    if (!demande) return res.status(404).json({ message: "Demande introuvable" });

    const passwordCrypte = await bcrypt.hash(demande.password, SALT_ROUNDS);
    const baseData = {
      nom: demande.nom, prenom: demande.prenom,
      email: demande.email + '_2',
      telephone: demande.telephone,
      password: passwordCrypte
    };

    if (demande.role === 'Professeur') await new Professeur(baseData).save();
    else if (demande.role === 'Administration') await new Administration(baseData).save();
    else if (demande.role === 'Etudiant') await new Etudiant({ ...baseData, classe: null }).save();

    await DemandeCompte.findByIdAndUpdate(req.params.id, { statut: 'accepte' });

    res.status(200).json({ message: "Compte créé avec email modifié !" });

  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.get('/get-demandes', async (req, res) => {
  try {
    const demandes = await DemandeCompte.find({ 
      statut: { $in: ['en_attente', null, undefined] }
    });
    res.status(200).send(demandes);
  } catch (err) {
    res.status(400).send(err);
  }
});
app.put('/accepter-demande/:id', async (req, res) => {
  try {
    const demande = await DemandeCompte.findById(req.params.id);
    if (!demande) return res.status(404).json({ message: "Demande introuvable" });

    if (demande.role === 'Professeur') {
      const exists = await Professeur.findOne({ email: demande.email });
      if (exists) return res.status(400).json({ message: "Un professeur avec cet email existe déjà" });
    } else if (demande.role === 'Administration') {
      const exists = await Administration.findOne({ email: demande.email });
      if (exists) return res.status(400).json({ message: "Une administration avec cet email existe déjà" });
    } else if (demande.role === 'Etudiant') {
      const exists = await Etudiant.findOne({ email: demande.email });
      if (exists) return res.status(400).json({ message: "Un étudiant avec cet email existe déjà" });
    }

    const passwordCrypte = await bcrypt.hash(demande.password, SALT_ROUNDS);

    if (demande.role === 'Professeur') {
      await new Professeur({
        nom: demande.nom, prenom: demande.prenom,
        email: demande.email, telephone: demande.telephone,
        password: passwordCrypte
      }).save();
    } else if (demande.role === 'Administration') {
      await new Administration({
        nom: demande.nom, prenom: demande.prenom,
        email: demande.email, telephone: demande.telephone,
        password: passwordCrypte
      }).save();
    } else if (demande.role === 'Etudiant') {
      await new Etudiant({
        nom: demande.nom, prenom: demande.prenom,
        email: demande.email, telephone: demande.telephone,
        password: passwordCrypte
      }).save();
    }

    await DemandeCompte.findByIdAndUpdate(req.params.id, { statut: 'accepte' });

    // ← Email sans mot de passe
    await transporter.sendMail({
      from: 'marammakhlouf2004@gmail.com',
      to: demande.email,
      subject: 'Votre demande de compte a été acceptée',
      html: `
        <h2>Bonjour ${demande.nom} ${demande.prenom} 👋</h2>
        <p>Votre demande de création de compte a été <strong style="color: green;">acceptée</strong> par l'administration.</p>
        <p>Vous pouvez maintenant vous connecter à votre espace <strong>${demande.role}</strong> avec vos identifiants.</p>
        <br>
        <p style="color: #999; font-size: 12px;">Si vous avez des questions, contactez l'administration.</p>
      `
    });

    res.status(200).json({ message: "Compte créé et email envoyé !" });
  } catch (err) {
    console.log('ERREUR:', err.message);
    res.status(400).json({ message: err.message });
  }
});

app.put('/refuser-demande/:id', async (req, res) => {
  try {
    const demande = await DemandeCompte.findById(req.params.id);
    if (!demande) return res.status(404).json({ message: "Demande introuvable" });

    // Envoyer email de refus
    await transporter.sendMail({
      from: 'marammakhlouf2004@gmail.com',
      to: demande.email,
      subject: 'Votre demande de compte a été refusée',
      html: `
        <h2>Bonjour ${demande.nom} ${demande.prenom},</h2>
        <p>Nous vous informons que votre demande de création de compte a été <strong style="color: red;">refusée</strong> par l'administration.</p>
        <p>Pour plus d'informations, veuillez contacter l'administration directement.</p>
        <br>
        <p style="color: #999; font-size: 12px;">Merci de votre compréhension.</p>
      `
    });

    await DemandeCompte.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Demande refusée et email envoyé !" });
  } catch (err) {
    res.status(400).send(err);
  }
});



// ═══════════════════════════════════════════════════════════════════════════════
// SEMESTRES
// ═══════════════════════════════════════════════════════════════════════════════
app.post('/cloturer-semestre', async (req, res) => {
  try {
    const { classeId, semestre } = req.body;
    const existing = await Semestre.findOne({ classe: classeId, semestre });
    if (existing) await Semestre.findByIdAndUpdate(existing._id, { statut: 'cloture' });
    else await new Semestre({ classe: classeId, semestre, statut: 'cloture' }).save();
    res.status(200).json({ message: "Semestre clôturé !" });
  } catch (err) {
    res.status(400).send(err);
  }
});

app.post('/decloturer-semestre', async (req, res) => {
  try {
    const { classeId, semestre } = req.body;
    const existing = await Semestre.findOne({ classe: classeId, semestre });
    if (existing) await Semestre.findByIdAndUpdate(existing._id, { statut: 'en_cours' });
    else await new Semestre({ classe: classeId, semestre, statut: 'en_cours' }).save();
    res.status(200).json({ message: "Notes cachées !" });
  } catch (err) {
    res.status(400).send(err);
  }
});

app.get('/get-statut-semestre/:classeId/:semestre', async (req, res) => {
  try {
    const semestre = await Semestre.findOne({ classe: req.params.classeId, semestre: req.params.semestre });
    res.status(200).json({ cloture: semestre?.statut === 'cloture' });
  } catch (err) {
    res.status(400).send(err);
  }
});

app.get('/get-semestres', async (req, res) => {
  try {
    const semestres = await Semestre.find().populate('classe');
    res.status(200).send(semestres);
  } catch (err) {
    res.status(400).send(err);
  }
});
app.post('/add-professeur-simple', async (req, res) => {
  try {
    // Vérifier si email existe
    const exist = await Professeur.findOne({ email: req.body.email });
    if (exist) {
      return res.status(400).json({ message: "Email déjà utilisé" });
    }

    // Hasher password
    const passwordCrypte = await bcrypt.hash(req.body.password, SALT_ROUNDS);

    // Créer professeur
    const prof = await new Professeur({
      ...req.body,
      password: passwordCrypte
    }).save();

    res.status(200).json({
      message: "Professeur ajouté avec succès",
      data: prof
    });

  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err });
  }
});
app.post('/add-etudiant-simple', async (req, res) => {
  try {
    const exist = await Etudiant.findOne({ email: req.body.email });
    if (exist) {
      return res.status(400).json({ message: "Email déjà utilisé" });
    }

    const passwordCrypte = await bcrypt.hash(req.body.password, SALT_ROUNDS);

    const etu = await new Etudiant({
      ...req.body,
      password: passwordCrypte
    }).save();

    res.status(200).json({
      message: "Étudiant ajouté avec succès",
      data: etu
    });

  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err });
  }
});




// Vérifier token d'invitation
app.post('/verifier-token-invitation', async (req, res) => {
  try {
    const { token } = req.body;
    const resetToken = await ResetToken.findOne({
      token,
      role: { $in: ['invitation', 'invitation-etudiant', 'invitation-administration'] }
    });
    if (!resetToken) return res.status(200).json({ valide: false });
    if (resetToken.expiration < new Date()) {
      await ResetToken.deleteOne({ token });
      return res.status(200).json({ valide: false });
    }
    res.status(200).json({ valide: true, email: resetToken.email, role: resetToken.role });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Compléter le profil professeur invité
app.post('/completer-profil', async (req, res) => {
  try {
    const { token, email, nom, prenom, telephone, password } = req.body;

    const resetToken = await ResetToken.findOne({ token });

    if (!resetToken) return res.status(400).json({ message: "Token invalide" });
    if (resetToken.expiration < new Date()) {
      await ResetToken.deleteOne({ token });
      return res.status(400).json({ message: "Token expiré" });
    }

    const passwordCrypte = await bcrypt.hash(password, SALT_ROUNDS);

    if (resetToken.role === 'invitation-etudiant') {
      await new Etudiant({
        email, nom, prenom, telephone,
        password: passwordCrypte,
        classe: resetToken.classe || null
      }).save();

    } else if (resetToken.role === 'invitation-administration') {
      await new Administration({
        email, nom, prenom, telephone,
        password: passwordCrypte
      }).save();

    } else {
      const exist = await Professeur.findOne({ email });
      if (exist) {
        await Professeur.findOneAndUpdate(
          { email },
          { nom, prenom, telephone, password: passwordCrypte }
        );
      } else {
        await new Professeur({
          email, nom, prenom, telephone,
          password: passwordCrypte,
          matieresAutorisees: []
        }).save();
      }
    }

    await ResetToken.deleteOne({ token });
    res.status(200).json({ message: "Compte activé avec succès !" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});














// DASHBOARD

app.get('/get-dashboard-stats', async (req, res) => {
  try {
    const [totalEtudiants, totalProfesseurs, totalClasses, classes, matieres] = await Promise.all([
      Etudiant.countDocuments(),
      Professeur.countDocuments(),
      Classe.countDocuments(),
      Classe.find(),
      Matiere.find()
    ]);

    const totalAbsences = await Absence.countDocuments({ type: 'absence' });

    const etudiantsParClasse = await Promise.all(
      classes.map(async cls => ({
        classe: cls.nom, classeId: cls._id,
        count: await Etudiant.countDocuments({ classe: cls._id })
      }))
    );

    const absencesParClasse = await Promise.all(
      classes.map(async cls => {
        const etudiants = await Etudiant.find({ classe: cls._id });
        const count = await Absence.countDocuments({
          etudiant: { $in: etudiants.map(e => e._id) },
          type: 'absence'
        });
        return { classe: cls.nom, classeId: cls._id, count };
      })
    );

    const absencesParMatiere = await Promise.all(
      matieres.map(async mat => ({
        matiere: mat.nom, classeId: mat.classe,
        count: await Absence.countDocuments({
          matiere: mat._id,
          type: 'absence'
        })
      }))
    );

    const SEUIL = 10;
    const resultatsParClasse = await Promise.all(
      classes.map(async cls => {
        const etudiants = await Etudiant.find({ classe: cls._id });
        const matieresClasse = await Matiere.find({ "classes.classe": cls._id })

        let totalReussi = 0;
        let totalRedoublant = 0;
        let totalAvecNotes = 0;

        for (const etu of etudiants) {
          let totalS1 = 0, totalS2 = 0;
          let countS1 = 0, countS2 = 0;

          for (const mat of matieresClasse) {
            const notesS1 = await Note.find({ etudiant: etu._id, matiere: mat._id, semestre: 'S1' });
            const notesS2 = await Note.find({ etudiant: etu._id, matiere: mat._id, semestre: 'S2' });

            if (notesS1.length > 0) {
              totalS1 += (notesS1.reduce((a, n) => a + n.note, 0) / notesS1.length) * mat.coefficient;
              countS1 += mat.coefficient;
            }
            if (notesS2.length > 0) {
              totalS2 += (notesS2.reduce((a, n) => a + n.note, 0) / notesS2.length) * mat.coefficient;
              countS2 += mat.coefficient;
            }
          }

          if (countS1 > 0 || countS2 > 0) {
            const moyS1 = countS1 > 0 ? totalS1 / countS1 : 0;
            const moyS2 = countS2 > 0 ? totalS2 / countS2 : 0;
            const diviseur = (countS1 > 0 ? 1 : 0) + (countS2 > 0 ? 1 : 0);
            const moyAnnee = (moyS1 + moyS2) / diviseur;
            totalAvecNotes++;
            if (moyAnnee >= SEUIL) totalReussi++;
            else totalRedoublant++;
          }
        }

        const pctReussi = totalAvecNotes > 0 ? Math.round((totalReussi / totalAvecNotes) * 100) : null;
        const pctRedoublant = totalAvecNotes > 0 ? Math.round((totalRedoublant / totalAvecNotes) * 100) : null;

        return {
          classe: cls.nom,
          classeId: cls._id,
          totalEtudiants: etudiants.length,
          totalReussi,
          totalRedoublant,
          pctReussi,
          pctRedoublant,
          notesCompletes: totalAvecNotes > 0
        };
      })
    );

    let totalReussiGlobal = 0;
    let totalRedoublantGlobal = 0;
    let totalAvecNotesGlobal = 0;

    for (const r of resultatsParClasse) {
      totalReussiGlobal += r.totalReussi;
      totalRedoublantGlobal += r.totalRedoublant;
      totalAvecNotesGlobal += r.totalReussi + r.totalRedoublant;
    }

    const tauxReussiteGlobal = totalAvecNotesGlobal > 0
      ? Math.round((totalReussiGlobal / totalAvecNotesGlobal) * 100)
      : 0;

    const tauxRedoublantGlobal = totalAvecNotesGlobal > 0
      ? Math.round((totalRedoublantGlobal / totalAvecNotesGlobal) * 100)
      : 0;

    res.status(200).json({
      totalEtudiants, totalProfesseurs, totalClasses, totalAbsences,
      etudiantsParClasse, absencesParClasse, absencesParMatiere,
      resultatsParClasse,
      tauxReussiteGlobal,
      tauxRedoublantGlobal
    });

  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err });
  }
});
app.get('/get-classe-detail/:classeId', async (req, res) => {
  try {
    const { classeId } = req.params;
    const [classe, countEtudiants, countMatieres, etudiants] = await Promise.all([
      Classe.findById(classeId),
      Etudiant.countDocuments({ classe: classeId }),
      Matiere.countDocuments({ classe: classeId }),
      Etudiant.find({ classe: classeId })
    ]);
   
const countAbsences = await Absence.countDocuments({ 
  etudiant: { $in: etudiants.map(e => e._id) },
  type: 'absence' 
});
    res.status(200).json({ classe: classe.nom, classeId, count: countEtudiants, matieres: countMatieres, absences: countAbsences });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err });
  }
});
app.get('/get-absences-ranking', async (req, res) => {
  try {
    const classes = await Classe.find();
    const ranking = await Promise.all(
      classes.map(async cls => {
        const matieres = await Matiere.find({ "classes.classe": cls._id });
        const matieresAvecAbsences = await Promise.all(
          matieres.map(async mat => ({
            matiere: mat.nom,
            count: await Absence.countDocuments({
              matiere: mat._id,
              type: 'absence'
            })
          }))
        );
        matieresAvecAbsences.sort((a, b) => b.count - a.count);
        return { classe: cls.nom, classeId: cls._id, matieres: matieresAvecAbsences };
      })
    );
    res.status(200).json(ranking);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err });
  }
});

app.get('/get-etudiants-risque', async (req, res) => {
  try {
    const SEUIL = 5;
    const classes = await Classe.find();
    const result = await Promise.all(
      classes.map(async cls => {
        const [etudiants, matieres] = await Promise.all([
          Etudiant.find({ classe: cls._id }),
          Matiere.find({ "classes.classe": cls._id })
        ]);
        const etudiantsRisque = (await Promise.all(
          etudiants.map(async etu => {
            const matieresRisque = (await Promise.all(
              matieres.map(async mat => {
              
const count = await Absence.countDocuments({ 
  etudiant: etu._id, 
  matiere: mat._id,
  type: 'absence'  
});
                return count > SEUIL ? { matiere: mat.nom, absences: count } : null;
              })
            )).filter(Boolean);
            return matieresRisque.length ? { nom: etu.nom, prenom: etu.prenom, matieres: matieresRisque } : null;
          })
        )).filter(Boolean);
        return etudiantsRisque.length ? { classe: cls.nom, etudiants: etudiantsRisque } : null;
      })
    );
    res.status(200).json(result.filter(Boolean));
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err });
  }
});

app.get('/get-top-etudiants/:classeId', async (req, res) => {
  try {
    const { classeId } = req.params;
    const SEUIL = 10;
    const [etudiants, matieres] = await Promise.all([
      Etudiant.find({ classe: classeId }),
      Matiere.find({ "classes.classe": classeId })
    ]);

    const resultats = await Promise.all(
      etudiants.map(async etu => {
        let totalS1 = 0, totalS2 = 0, countS1 = 0, countS2 = 0;
        const moyParMatiere = {};

        for (const mat of matieres) {
          const notesS1 = await Note.find({ etudiant: etu._id, matiere: mat._id, semestre: 'S1' });
          const notesS2 = await Note.find({ etudiant: etu._id, matiere: mat._id, semestre: 'S2' });

          const mS1 = notesS1.length > 0 ? notesS1.reduce((a, n) => a + n.note, 0) / notesS1.length : null;
          const mS2 = notesS2.length > 0 ? notesS2.reduce((a, n) => a + n.note, 0) / notesS2.length : null;

          if (mS1 !== null) { totalS1 += mS1 * mat.coefficient; countS1 += mat.coefficient; }
          if (mS2 !== null) { totalS2 += mS2 * mat.coefficient; countS2 += mat.coefficient; }

          if (mS1 !== null || mS2 !== null) {
            moyParMatiere[mat.nom] = (((mS1 || 0) + (mS2 || 0)) / ((mS1 !== null ? 1 : 0) + (mS2 !== null ? 1 : 0))).toFixed(2);
          }
        }

        const moyS1 = countS1 > 0 ? (totalS1 / countS1).toFixed(2) : null;
        const moyS2 = countS2 > 0 ? (totalS2 / countS2).toFixed(2) : null;
        const moyAnnee = moyS1 && moyS2 ? ((parseFloat(moyS1) + parseFloat(moyS2)) / 2).toFixed(2) : null;

        return {
          nom: etu.nom, prenom: etu.prenom,
          moyS1, moyS2, moyAnnee,
          reussi: moyAnnee !== null ? parseFloat(moyAnnee) >= SEUIL : null,
          moyParMatiere
        };
      })
    );

    const tries = resultats
      .filter(r => r.moyAnnee !== null)
      .sort((a, b) => parseFloat(b.moyAnnee) - parseFloat(a.moyAnnee));

    const top5 = tries.slice(0, 5);
    const totalReussi = resultats.filter(r => r.reussi === true).length;
    const totalRedoublant = resultats.filter(r => r.reussi === false).length;
    const notesCompletes = resultats.every(r => r.moyAnnee !== null);

    // Moyennes par matière (moyenne de tous les étudiants)
    const moyennesParMatiere = matieres.map(mat => {
      const vals = resultats
        .map(r => r.moyParMatiere[mat.nom])
        .filter(v => v !== undefined)
        .map(v => parseFloat(v));
      const moy = vals.length > 0 ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2) : null;
      return { matiere: mat.nom, moyenne: moy };
    }).filter(m => m.moyenne !== null);

    res.status(200).json({
      top5, totalReussi, totalRedoublant,
      totalEtudiants: etudiants.length,
      notesCompletes, moyennesParMatiere
    });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err });
  }
});




















// chatbot

app.post('/chat-etudiant', async (req, res) => {
  try {
    const { message, etudiantId } = req.body;

    if (!etudiantId) {
      return res.json({ reply: "Veuillez vous reconnecter pour accéder à vos données." });
    }

    const tools = [
      {
        type: "function",
        function: {
          name: "get_absences",
          description: "Récupère les absences de l'étudiant. Permet de filtrer par matière et/ou par type (absence ou retard) et/ou justifiée.",
          parameters: {
            type: "object",
            properties: {
              matiere: { type: "string", description: "Nom de la matière (ex: arabe, math, francais). Optionnel." },
              type: { type: "string", enum: ["absence", "retard"], description: "Type: absence ou retard. Optionnel." },
              justifiee: { type: "boolean", description: "true pour justifiées, false pour non justifiées. Optionnel." }
            }
          }
        }
      },
      {
        type: "function",
        function: {
          name: "get_notes",
          description: "Récupère les notes de l'étudiant. Permet de filtrer par matière, semestre ou type d'évaluation.",
          parameters: {
            type: "object",
            properties: {
              matiere: { type: "string", description: "Nom de la matière. Optionnel." },
              semestre: { type: "string", enum: ["S1", "S2"], description: "Semestre. Optionnel." },
              type: { type: "string", enum: ["DS1", "DS2", "Examen", "TP"], description: "Type d'évaluation. Optionnel." }
            }
          }
        }
      },
      {
        type: "function",
        function: {
          name: "get_moyenne",
          description: "Calcule la moyenne de l'étudiant pour une matière ou globale.",
          parameters: {
            type: "object",
            properties: {
              matiere: { type: "string", description: "Matière. Si vide, calcule la moyenne générale." },
              semestre: { type: "string", enum: ["S1", "S2"], description: "Semestre. Optionnel." }
            }
          }
        }
      },
      {
        type: "function",
        function: {
          name: "get_emploi",
          description: "Récupère l'emploi du temps de l'étudiant. Filtrable par jour.",
          parameters: {
            type: "object",
            properties: {
              jour: { type: "string", description: "Lundi, Mardi, Mercredi, Jeudi ou Vendredi. Optionnel." }
            }
          }
        }
      },
      {
        type: "function",
        function: {
          name: "get_info_etudiant",
          description: "Récupère les informations générales de l'étudiant (nom, classe, email).",
          parameters: { type: "object", properties: {} }
        }
      }
    ];

    const messages = [
      {
        role: 'system',
        content: `Tu es un assistant intelligent pour un étudiant. Tu réponds à ses questions sur ses notes, absences, retards, moyennes, et emploi du temps. Réponds toujours en français de manière courte, claire et amicale. Utilise les fonctions disponibles pour récupérer les données réelles. Ne devine jamais les chiffres.`
      },
      { role: 'user', content: message }
    ];

    let completion = await groq.chat.completions.create({
      messages, tools,
      model: 'llama-3.3-70b-versatile',
      tool_choice: 'auto'
    });

    const toolCalls = completion.choices[0].message.tool_calls;

    if (toolCalls && toolCalls.length > 0) {
      messages.push(completion.choices[0].message);

      for (const call of toolCalls) {
        const args = JSON.parse(call.function.arguments);
        let result;

        if (call.function.name === 'get_absences') {
          let filtre = { etudiant: etudiantId };
          if (args.type) filtre.type = args.type;
          if (args.justifiee !== undefined) filtre.justifiee = args.justifiee;

          let absences = await Absence.find(filtre).populate('matiere');

          if (args.matiere) {
            absences = absences.filter(a =>
              a.matiere?.nom?.toLowerCase().includes(args.matiere.toLowerCase())
            );
          }

          result = {
            total: absences.length,
            details: absences.map(a => ({
              matiere: a.matiere?.nom,
              date: a.date,
              type: a.type,
              justifiee: a.justifiee,
              dureeRetard: a.dureeRetard
            }))
          };

        } else if (call.function.name === 'get_notes') {
          let filtre = { etudiant: etudiantId };
          if (args.semestre) filtre.semestre = args.semestre;
          if (args.type) filtre.type = args.type;

          let notes = await Note.find(filtre).populate('matiere');

          if (args.matiere) {
            notes = notes.filter(n =>
              n.matiere?.nom?.toLowerCase().includes(args.matiere.toLowerCase())
            );
          }

          result = notes.map(n => ({
            matiere: n.matiere?.nom,
            type: n.type,
            note: n.note,
            semestre: n.semestre
          }));

        } else if (call.function.name === 'get_moyenne') {
          let filtre = { etudiant: etudiantId };
          if (args.semestre) filtre.semestre = args.semestre;

          let notes = await Note.find(filtre).populate('matiere');

          if (args.matiere) {
            notes = notes.filter(n =>
              n.matiere?.nom?.toLowerCase().includes(args.matiere.toLowerCase())
            );

            if (notes.length === 0) {
              result = { moyenne: null, message: "Aucune note pour cette matière" };
            } else {
              const somme = notes.reduce((acc, n) => acc + n.note, 0);
              result = {
                moyenne: (somme / notes.length).toFixed(2),
                nombreNotes: notes.length,
                matiere: args.matiere
              };
            }
          } else {
            // Moyenne générale par matière
            const parMat = {};
            notes.forEach(n => {
              const nom = n.matiere?.nom || 'Inconnue';
              if (!parMat[nom]) parMat[nom] = [];
              parMat[nom].push(n.note);
            });

            const moyennes = {};
            Object.entries(parMat).forEach(([m, ns]) => {
              moyennes[m] = (ns.reduce((a, b) => a + b, 0) / ns.length).toFixed(2);
            });

            const toutesLesNotes = Object.values(parMat).flat();
            const moyGenerale = toutesLesNotes.length > 0
              ? (toutesLesNotes.reduce((a, b) => a + b, 0) / toutesLesNotes.length).toFixed(2)
              : null;

            result = {
              moyenneGenerale: moyGenerale,
              moyennesParMatiere: moyennes
            };
          }

        } else if (call.function.name === 'get_emploi') {
          const etudiant = await Etudiant.findById(etudiantId);
          if (!etudiant?.classe) {
            result = { message: "Aucune classe affectée" };
          } else {
            let emploi = await EmploiDuTemps.find({ classe: etudiant.classe })
              .populate('matiere')
              .populate('professeur');

            if (args.jour) {
              emploi = emploi.filter(e => e.jour.toLowerCase() === args.jour.toLowerCase());
            }

            result = emploi.map(e => ({
              jour: e.jour,
              heureDebut: e.heureDebut,
              heureFin: e.heureFin,
              matiere: e.matiere?.nom,
              professeur: `${e.professeur?.nom || ''} ${e.professeur?.prenom || ''}`.trim(),
              salle: e.salle
            }));
          }

        } else if (call.function.name === 'get_info_etudiant') {
          const etudiant = await Etudiant.findById(etudiantId).populate('classe');
          result = {
            nom: etudiant.nom,
            prenom: etudiant.prenom,
            email: etudiant.email,
            classe: etudiant.classe?.nom,
            niveau: etudiant.classe?.niveau
          };
        }

        messages.push({
          role: 'tool',
          tool_call_id: call.id,
          content: JSON.stringify(result)
        });
      }

      completion = await groq.chat.completions.create({
        messages,
        model: 'llama-3.3-70b-versatile'
      });
    }

    res.json({ reply: completion.choices[0].message.content });
  } catch (err) {
    console.error('Erreur chat-etudiant:', err);
    res.status(500).json({ reply: 'Erreur serveur, veuillez réessayer.' });
  }
});

app.listen(3000, () => console.log('Serveur Node lancé sur port 3000'));