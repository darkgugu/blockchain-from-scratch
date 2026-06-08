import argparse
import uuid

from flask import Flask, jsonify, request

from blockchain import Blockchain, Transaction, Wallet

app = Flask(__name__)

# Unique node identifier (serves as miner address)
node_id = str(uuid.uuid4()).replace('-', '')

blockchain = Blockchain()


@app.route('/chain', methods=['GET'])
def get_chain():
    chain_data = []
    for block in blockchain.chain:
        chain_data.append({
            'index': block.index,
            'timestamp': block.timestamp,
            'transactions': [tx.to_dict() for tx in block.transactions],
            'nonce': block.nonce,
            'previous_hash': block.previous_hash,
            'hash': block.hash,
        })
    return jsonify({
        'chain': chain_data,
        'length': len(blockchain.chain),
        'valid': blockchain.is_chain_valid(),
    }), 200


@app.route('/transaction/new', methods=['POST'])
def new_transaction():
    values = request.get_json()
    if not values:
        return jsonify({'error': 'Request must be JSON'}), 400

    required = ['sender', 'receiver', 'amount']
    if not all(k in values for k in required):
        return jsonify({'error': 'Missing values'}), 400

    try:
        amount = float(values['amount'])
    except (TypeError, ValueError):
        return jsonify({'error': 'Amount must be a number'}), 400

    transaction = Transaction(values['sender'], values['receiver'], amount)
    index = blockchain.create_transaction(transaction)
    return jsonify({'message': f'Transaction will be added to block {index}'}), 201


@app.route('/mine', methods=['GET'])
def mine():
    block = blockchain.mine_pending_transactions(node_id)
    return jsonify({
        'message': 'New block mined',
        'index': block.index,
        'transactions': [tx.to_dict() for tx in block.transactions],
        'nonce': block.nonce,
        'previous_hash': block.previous_hash,
        'hash': block.hash,
    }), 200


@app.route('/nodes/register', methods=['POST'])
def register_nodes():
    values = request.get_json()
    if not values:
        return jsonify({'error': 'Request must be JSON'}), 400

    nodes = values.get('nodes')
    if nodes is None:
        return jsonify({'error': 'Please supply a valid list of nodes'}), 400

    for node in nodes:
        blockchain.add_node(node)

    return jsonify({
        'message': 'New nodes have been added',
        'total_nodes': list(blockchain.nodes),
    }), 201


@app.route('/nodes/resolve', methods=['GET'])
def consensus():
    replaced = blockchain.resolve_conflicts()
    if replaced:
        chain_data = []
        for block in blockchain.chain:
            chain_data.append({
                'index': block.index,
                'timestamp': block.timestamp,
                'transactions': [tx.to_dict() for tx in block.transactions],
                'nonce': block.nonce,
                'previous_hash': block.previous_hash,
                'hash': block.hash,
            })
        return jsonify({
            'message': 'Our chain was replaced',
            'new_chain': chain_data,
        }), 200
    else:
        chain_data = []
        for block in blockchain.chain:
            chain_data.append({
                'index': block.index,
                'timestamp': block.timestamp,
                'transactions': [tx.to_dict() for tx in block.transactions],
                'nonce': block.nonce,
                'previous_hash': block.previous_hash,
                'hash': block.hash,
            })
        return jsonify({
            'message': 'Our chain is authoritative',
            'chain': chain_data,
        }), 200


@app.route('/balance', methods=['GET'])
def get_balance():
    address = request.args.get('address')
    if not address:
        return jsonify({'error': 'Missing address parameter'}), 400
    balance = blockchain.get_balance(address)
    return jsonify({'address': address, 'balance': balance}), 200


@app.route('/wallet/new', methods=['GET'])
def new_wallet():
    wallet = Wallet()
    return jsonify({'public_key': wallet.public_key}), 200


@app.route('/wallet/balance', methods=['GET'])
def wallet_balance():
    public_key = request.args.get('public_key')
    if not public_key:
        return jsonify({'error': 'Missing public_key parameter'}), 400
    balance = blockchain.get_balance(public_key)
    return jsonify({'public_key': public_key, 'balance': balance}), 200


@app.route('/debug/tamper', methods=['POST'])
def tamper():
    if len(blockchain.chain) < 2:
        return jsonify({'message': 'Need at least 2 blocks to tamper', 'valid': True}), 200

    # Corrupt block 1 by altering its data directly
    target_block = blockchain.chain[1]
    if target_block.transactions:
        target_block.transactions[0].amount += 9999
    else:
        target_block.transactions.append(Transaction('TAMPER', 'TAMPER', 9999))

    # Recalculate hash with corrupted data (will break PoW)
    target_block.hash = target_block.calculate_hash()

    valid = blockchain.is_chain_valid()
    return jsonify({
        'message': f'Block {target_block.index} tampered. Chain is now invalid.',
        'valid': valid,
    }), 200


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Blockchain Node')
    parser.add_argument('--port', type=int, default=5001, help='Port to run on')
    parser.add_argument('--difficulty', type=int, default=4, help='Mining difficulty')
    args = parser.parse_args()

    blockchain.difficulty = args.difficulty

    app.run(host='0.0.0.0', port=args.port, debug=False)
