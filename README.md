# TP Blockchain — ESGI M1

Implémentation d'une blockchain simplifiée en Python avec un dashboard Next.js.

## Algorithme de consensus : Proof of Work (PoW)

### Justification

Nous avons choisi le **Proof of Work** pour les raisons suivantes :

1. **Standard industriel éprouvé** : Le PoW est l'algorithme utilisé par Bitcoin depuis 2009. Sa robustesse et sa simplicité en font une référence pour comprendre les mécanismes de consensus.

2. **Démonstration intuitive** : Le processus de recherche du nonce est visible et compréhensible — le mineur incrémente un compteur jusqu'à trouver un hash commençant par N zéros. Le dashboard affiche cette recherche en temps réel.

3. **Détection de fraude triviale** : Modifier un bloc recalcule son hash, qui ne satisfait plus la contrainte PoW (`"0000"`), et rompt le chaînage avec le bloc suivant. `is_chain_valid()` détecte instantanément la corruption.

4. **Cohérence avec le cours** : Le PoW est le premier algorithme présenté dans le cours ESGI Blockchain 2026, avec une description détaillée du mécanisme SHA-256 et des attaques 51%.

### Paramètres

| Paramètre | Valeur | Description |
|-----------|--------|-------------|
| `difficulty` | 4 | Le hash doit commencer par `"0000"` |
| `mining_reward` | 100 MSK | Tokens MessdakToken versés au mineur |
| Algorithme de hash | SHA-256 | Via `hashlib` Python stdlib |

La difficulté est configurable via `--difficulty N` au lancement d'un nœud.

---

## Architecture

```
projet/
├── backend/
│   ├── blockchain.py    # Block, Transaction, Blockchain, MessdakToken, Wallet
│   ├── node.py          # Application Flask + 9 routes REST
│   ├── run_nodes.sh     # Lance 3 nœuds (ports 5001/5002/5003)
│   ├── tamper.py        # Script de démonstration fraude
│   └── requirements.txt
├── frontend/            # Dashboard Next.js 15
│   ├── app/
│   │   ├── page.tsx     # Dashboard principal
│   │   └── api/proxy/   # Proxy CORS → Flask
│   ├── components/      # ChainViz, MiningPanel, TxForm, NodeSelector, BlockDetail
│   └── lib/             # api.ts, types.ts
└── README.md
```

---

## Lancement

### Prérequis

- Python 3.11+
- Node.js 20+
- npm

### Backend

```bash
cd backend
pip install -r requirements.txt

# Lancer les 3 nœuds (s'enregistrent automatiquement entre eux)
bash run_nodes.sh
```

Les 3 nœuds démarrent sur :
- Nœud 1 : http://localhost:5001
- Nœud 2 : http://localhost:5002
- Nœud 3 : http://localhost:5003

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Ouvrir **http://localhost:3000** dans le navigateur.

### Interaction via curl (sans dashboard)

```bash
# Ajouter une transaction
curl -X POST http://localhost:5001/transaction/new \
  -H "Content-Type: application/json" \
  -d '{"sender":"alice","receiver":"bob","amount":50}'

# Miner un bloc
curl http://localhost:5001/mine

# Consulter la chaîne
curl http://localhost:5001/chain | python3 -m json.tool

# Résoudre les conflits (adopter la chaîne la plus longue)
curl http://localhost:5002/nodes/resolve

# Créer un portefeuille
curl http://localhost:5001/wallet/new

# Consulter un solde
curl "http://localhost:5001/balance?address=alice"

# Démonstration fraude
curl -X POST http://localhost:5001/debug/tamper
```

---

## Routes API

| Route | Méthode | Description |
|-------|---------|-------------|
| `/chain` | GET | Retourne la chaîne complète + validité |
| `/transaction/new` | POST | Ajoute une transaction au mempool |
| `/mine` | GET | Mine un nouveau bloc |
| `/nodes/register` | POST | Enregistre des nœuds pairs |
| `/nodes/resolve` | GET | Résolution de conflits (longest chain) |
| `/balance` | GET | Solde d'une adresse MessdakToken |
| `/wallet/new` | GET | Crée un nouveau portefeuille |
| `/wallet/balance` | GET | Solde d'un portefeuille |
| `/debug/tamper` | POST | (Démo) Corrompt un bloc |

---

## Démonstration des 5 points requis

### 1. Création de bloc et chaînage

Miner 2 blocs puis vérifier :
```bash
curl http://localhost:5001/chain | python3 -c "
import json, sys
d = json.load(sys.stdin)
chain = d['chain']
for i in range(1, len(chain)):
    match = chain[i]['previous_hash'] == chain[i-1]['hash']
    print(f'Bloc {i}: previous_hash matches bloc {i-1}: {match}')
"
```

### 2. Ajout et minage

Via le dashboard : TxForm → MiningPanel. Ou via curl :
```bash
curl -X POST http://localhost:5001/transaction/new -H "Content-Type: application/json" -d '{"sender":"alice","receiver":"bob","amount":10}'
curl http://localhost:5001/mine
```

### 3. Détection de fraude

```bash
curl -X POST http://localhost:5001/debug/tamper
# → {"message": "Block 1 tampered...", "valid": false}
```
Le dashboard affiche les blocs en rouge.

### 4. Résolution de conflits

```bash
# Miner 2 blocs sur noeud 1
curl http://localhost:5001/mine && curl http://localhost:5001/mine
# Noeud 2 n'a que le genesis
curl http://localhost:5002/chain | python3 -c "import json,sys; print('length:', json.load(sys.stdin)['length'])"
# → length: 1
# Résoudre
curl http://localhost:5002/nodes/resolve
# → {"message": "Our chain was replaced", ...}
```

### 5. Validité du consensus

Un bloc avec un nonce ne satisfaisant pas le PoW est rejeté par `is_chain_valid()`. Démonstration via `/debug/tamper` qui corrompt un bloc et rend immédiatement la chaîne invalide.

---

## Économie MessdakToken (MSK)

Chaque mineur reçoit 100 MSK par bloc miné. Les soldes sont gérés par `MessdakToken` et consultables via `/balance`.

---

## Difficultés rencontrées

- **Sérialisation cohérente pour le hachage** : `calculate_hash()` doit produire un résultat identique à chaque appel. Utiliser `str([tx.to_dict() for tx in self.transactions])` garantit un ordre déterministe, contrairement à `str(object)` qui peut varier.

- **Désérialisation lors de `resolve_conflicts()`** : La méthode `_deserialize_chain()` reconstruit des objets `Block` depuis le JSON Flask. Sans cette étape, `calculate_hash()` ne peut pas être appelé sur la chaîne distante pour la valider.

- **Ordre critique dans `mine_pending_transactions()`** : `process_transactions()` doit être appelé AVANT `add_block()`, car `add_block()` réinitialise `pending_transactions = []` après avoir miné. Un appel dans le mauvais ordre provoque des transactions perdues silencieusement.

- **Gestion du CORS entre Next.js et Flask** : Le navigateur bloque les appels directs de `localhost:3000` vers `localhost:5001`. Résolu par un proxy route handler Next.js (`/api/proxy/[node]/[...path]`) qui relaie côté serveur, avec une whitelist `ALLOWED_PORTS` pour la sécurité.

- **`@xyflow/react` v12 nécessite des exports nommés** : `import { ReactFlow, ... }` uniquement — il n'y a plus d'export default comme dans les versions précédentes. De plus, le conteneur doit avoir une hauteur fixe pour que le graphe s'affiche.

---

## Dépendances

### Backend
- `flask>=3.0`
- `requests>=2.31`

### Frontend
- `next@16.x`, `react@19.x`
- `@xyflow/react@12.x`
- `framer-motion@11.x`
- `tailwindcss@4.x`
