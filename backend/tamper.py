"""
Demo script: tamper with block 1 on node 5001 via the /debug/tamper endpoint.
Run this after mining at least 2 blocks.
"""
import requests
import json


def main():
    url = 'http://localhost:5001/debug/tamper'
    print(f'Sending tamper request to {url}...')
    response = requests.post(url, headers={'Content-Type': 'application/json'})
    data = response.json()
    print(json.dumps(data, indent=2))

    # Show chain validity after tamper
    chain_resp = requests.get('http://localhost:5001/chain')
    chain_data = chain_resp.json()
    print(f'\nChain valid: {chain_data["valid"]}')
    print(f'Chain length: {chain_data["length"]}')


if __name__ == '__main__':
    main()
