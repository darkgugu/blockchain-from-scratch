import hashlib
import datetime
import secrets
from urllib.parse import urlparse
import requests


class Transaction:
    def __init__(self, sender, receiver, amount):
        self.sender = sender
        self.receiver = receiver
        self.amount = amount

    def to_dict(self):
        return {
            'sender': self.sender,
            'receiver': self.receiver,
            'amount': self.amount,
        }


class Block:
    def __init__(self, index, timestamp, transactions, previous_hash):
        self.index = index
        self.timestamp = timestamp
        self.transactions = transactions
        self.previous_hash = previous_hash
        self.nonce = 0
        self.hash = self.calculate_hash()

    def calculate_hash(self):
        tx_str = str([tx.to_dict() for tx in self.transactions])
        block_string = (
            str(self.index)
            + str(self.timestamp)
            + tx_str
            + str(self.previous_hash)
            + str(self.nonce)
        )
        return hashlib.sha256(block_string.encode()).hexdigest()

    def mine_block(self, difficulty):
        target = '0' * difficulty
        while self.hash[:difficulty] != target:
            self.nonce += 1
            self.hash = self.calculate_hash()
        print(f'Block #{self.index} mined: {self.hash}')

    @classmethod
    def _from_dict(cls, index, timestamp, transactions, previous_hash, nonce, hash_value):
        """Reconstruct a Block from serialized data without running the PoW loop."""
        block = cls.__new__(cls)
        block.index = index
        block.timestamp = timestamp
        block.transactions = transactions
        block.previous_hash = previous_hash
        block.nonce = nonce
        block.hash = hash_value
        return block


class MessdakToken:
    def __init__(self):
        self.total_supply = 1_000_000
        self.balance = {}

    def create_transaction(self, sender, receiver, amount):
        if sender is not None:
            if sender not in self.balance:
                # Permissive bootstrap: first-time senders receive total_supply.
                # Simplified TP design (matches tutorial) — not production-safe.
                self.balance[sender] = self.total_supply
            if self.balance[sender] < amount:
                return False
            self.balance[sender] -= amount
        if receiver not in self.balance:
            self.balance[receiver] = 0
        self.balance[receiver] += amount
        return True

    def get_balance(self, address):
        return self.balance.get(address, 0)


class Wallet:
    def __init__(self):
        self.private_key = secrets.token_hex(32)
        self.public_key = hashlib.sha256(self.private_key.encode()).hexdigest()

    def get_balance(self, blockchain):
        return blockchain.get_balance(self.public_key)


class Blockchain:
    def __init__(self):
        self.chain = [self._create_genesis_block()]
        self.difficulty = 4
        self.pending_transactions = []
        self.mining_reward = 100
        self.token = MessdakToken()
        self.nodes = set()

    def _create_genesis_block(self):
        return Block(0, str(datetime.datetime.now()), [], '0')

    def get_latest_block(self):
        return self.chain[-1]

    def add_block(self, new_block):
        new_block.previous_hash = self.get_latest_block().hash
        new_block.mine_block(self.difficulty)
        self.chain.append(new_block)
        self.pending_transactions = []

    def create_transaction(self, transaction):
        self.pending_transactions.append(transaction)
        return self.get_latest_block().index + 1

    def process_transactions(self):
        for tx in self.pending_transactions:
            if tx.sender is not None:
                if not self.token.create_transaction(tx.sender, tx.receiver, tx.amount):
                    return False
        return True

    def mine_pending_transactions(self, miner_address):
        reward_tx = Transaction(None, miner_address, self.mining_reward)
        self.pending_transactions.append(reward_tx)

        # CRITICAL: process_transactions() BEFORE add_block()
        # add_block() resets pending_transactions = [] at the end
        if not self.process_transactions():
            print('Warning: one or more transactions had insufficient funds')
        self.token.create_transaction(None, miner_address, self.mining_reward)

        new_block = Block(
            len(self.chain),
            str(datetime.datetime.now()),
            self.pending_transactions,
            self.get_latest_block().hash,
        )
        self.add_block(new_block)
        return new_block

    def get_balance(self, address):
        return self.token.get_balance(address)

    def is_valid_proof(self, block, difficulty):
        return block.hash[:difficulty] == '0' * difficulty

    def is_chain_valid(self, chain=None):
        if chain is None:
            chain = self.chain
        for i in range(1, len(chain)):
            current = chain[i]
            previous = chain[i - 1]
            if current.hash != current.calculate_hash():
                return False
            if current.previous_hash != previous.hash:
                return False
            if not self.is_valid_proof(current, self.difficulty):
                return False
        return True

    def add_node(self, node_url):
        if '://' not in node_url:
            node_url = 'http://' + node_url
        parsed = urlparse(node_url)
        self.nodes.add(f'http://{parsed.netloc}')

    def replace_chain(self):
        longest_chain = None
        max_length = len(self.chain)
        for node in self.nodes:
            try:
                response = requests.get(f'{node}/chain', timeout=5)
                if response.status_code == 200:
                    data = response.json()
                    length = data['length']
                    raw_chain = data['chain']
                    if length > max_length:
                        chain = self._deserialize_chain(raw_chain)
                        if chain and self.is_chain_valid(chain):
                            max_length = length
                            longest_chain = chain
            except Exception:
                continue
        if longest_chain:
            self.chain = longest_chain
            return True
        return False

    def _deserialize_chain(self, raw_chain):
        chain = []
        for raw_block in raw_chain:
            transactions = [
                Transaction(tx['sender'], tx['receiver'], tx['amount'])
                for tx in raw_block['transactions']
            ]
            block = Block._from_dict(
                raw_block['index'],
                raw_block['timestamp'],
                transactions,
                raw_block['previous_hash'],
                raw_block['nonce'],
                raw_block['hash'],
            )
            chain.append(block)
        return chain

    def resolve_conflicts(self):
        replaced = self.replace_chain()
        if replaced:
            self.pending_transactions = []
        return replaced
