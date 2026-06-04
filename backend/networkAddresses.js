// Receiving (destination) addresses per Mesh network.
//
// The cart lets a shopper pick any supported network + token, but each chain
// needs a destination address that is valid for THAT chain (an EVM address is
// not valid on Solana, Bitcoin, etc.). This map holds the merchant receiving
// address for each network.
//
// HOW TO FILL THIS IN
//   - Put your receiving address for a network in its `address` field.
//   - Leave `address: ''` for any network you don't have an address for yet.
//     When a shopper selects such a network the checkout falls back to asking
//     them to provide the destination address (see resolveToAddress + the cart
//     address input).
//   - Optional: to use a different address for a specific token on a network,
//     add a `tokens` map, e.g. tokens: { USDC: '0x...', USDT: '0x...' }.
//     A `tokens` entry takes precedence over the network-wide `address`.
//
// Keys are Mesh networkIds (stable across sandbox/production). The `tokens`
// comment on each entry lists the symbols that network currently supports.

const NETWORK_ADDRESSES = {
  // --- EVM networks (an EVM address works across all of these) ---
  'aa883b03-120d-477c-a588-37c2afd3ca71': { name: 'Base',          address: '0x6A36e7e3682Ff903a0680Da2F8C5f2a34A3d3266' }, // ETH,EURC,USDC,VIRTUAL,WETH
  'e3c7fdd8-b1fc-4e51-85ae-bb276e075611': { name: 'Ethereum',      address: '0x6A36e7e3682Ff903a0680Da2F8C5f2a34A3d3266' }, // 1INCH,AAVE,APE,ARB,...,ETH
  'a34f2431-0ddd-4de4-bc22-4a8143287aeb': { name: 'Arbitrum',      address: '0x6A36e7e3682Ff903a0680Da2F8C5f2a34A3d3266' }, // ARB,DAI,ETH,PYUSD,USDC,USDT,WETH
  '18fa36b0-88a8-43ca-83db-9a874e0a2288': { name: 'Optimism',      address: '0x6A36e7e3682Ff903a0680Da2F8C5f2a34A3d3266' }, // DAI,ETH,OP,SNX,USDC,USDT,WETH
  '7436e9d0-ba42-4d2b-b4c0-8e4e606b2c12': { name: 'Polygon',       address: '0x6A36e7e3682Ff903a0680Da2F8C5f2a34A3d3266' }, // DAI,POL,USDC,USDT,WMATIC
  'ed0ebeec-b166-4c8b-8574-cb078f7af8cf': { name: 'BSC',           address: '0x6A36e7e3682Ff903a0680Da2F8C5f2a34A3d3266' }, // BNB,CAKE,DEXE,FDUSD,FORM,LTC,USD1,USDC,USDT,WBNB,WLFI
  'bad16371-c22a-4bf4-a311-274d046cd760': { name: 'AvalancheC',    address: '' }, // AVAX,DAI,EURC,USDC,USDE,USDT,WAVAX
  '042e7535-bb07-4cda-a732-a243ea9f8250': { name: 'Cronos',        address: '' }, // CRO,USDC,USDT
  '46e4920f-bbb6-4970-95d0-5be58c526a82': { name: 'Linea',         address: '0x6A36e7e3682Ff903a0680Da2F8C5f2a34A3d3266' }, // ETH,MUSD,USDC,USDT
  'd6cb0153-751e-43a1-9322-53a5229de75c': { name: 'WorldChain',    address: '' }, // ETH,USDC,WLD
  '59836f7c-c9a7-4d47-aa17-70cb910445fa': { name: 'HyperEVM',      address: '' }, // HYPE,USDC,USDH,USD₮0,WHYPE
  '385f0b3a-8471-4b8f-884f-c4f4496f1603': { name: 'Sonic',         address: '' }, // EURC,S
  '0c17e03f-77fa-4644-b84c-eb247af8c4c1': { name: 'Blast',         address: '' }, // BLAST,ETH,WETH
  '48832432-6908-45e5-a4e2-d46446c8047e': { name: 'Ink',           address: '' }, // ETH,USDC
  '6b5ced13-aaa4-4fda-b95a-27c7c68c2601': { name: 'Monad',         address: '' }, // MON,MUSD,USD1,USDC,USDT,WMON
  'e7f8a9b0-1c2d-4e3f-9a0b-2c3d4e5f6a7b': { name: 'Tempo',         address: '' }, // ETH,PATHUSD,USDC,USD₮0
  'bbfd5e33-a345-4f63-9274-32280ed1d4ec': { name: 'MegaETH',       address: '0x6A36e7e3682Ff903a0680Da2F8C5f2a34A3d3266' }, // ETH,USDM,USDT
  '525a7a5a-2ac9-4772-af5a-b8f006516497': { name: 'Sei',           address: '' }, // SEI,USDC

  // --- Non-EVM networks (each needs an address native to that chain) ---
  '0291810a-5947-424d-9a59-e88bb33e999d': { name: 'Solana',        address: '3LSY1RY1bbJNpbT3Tujs2qrV9W8sksUVUkG8TecCxc5b' }, // CASH,EURC,FARTCOIN,FDUSD,PENGU,PYUSD,SOL,...
  '03dee5da-7398-428f-9ec2-ab41bcb271da': { name: 'Bitcoin',       address: 'bc1qrrflequa04wry74dclwpaua3r03gq44wkpflul' }, // BTC
  'c5dc5d2e-68c1-4261-9a30-90b598738bf5': { name: 'Tron',          address: 'TRP687Xe5bkq82MbD6Q3qYWzst9z3xtFZy' }, // TRX,USDC,USDT
  '1709a5dc-d114-4683-bf95-5a5abb54df31': { name: 'Litecoin',      address: '' }, // LTC
  '34b66a94-f9f9-49ef-81e8-6ebd5a866f9d': { name: 'Dogecoin',      address: '' }, // DOGE
  '0ea47ee7-9d36-460e-a2d5-64cfa8a1dddd': { name: 'XRPL',          address: '' }, // XRP
  '06855704-43d2-4ad2-a73c-372f0c3534e1': { name: 'Stellar',       address: '' }, // EURC,USDC,XLM
  '9cc3f8db-809a-4d06-a183-34a63a84aca8': { name: 'Cardano',       address: '' }, // ADA
  '3d71a957-740b-4195-a437-389d171f21bb': { name: 'TON',           address: '' }, // TON,USDT
  '0072c6e2-0e76-4265-9ac4-46bad109f599': { name: 'Sui',           address: '' }, // FDUSD,SUI,USDC,USDT
  'c6427cfd-8ddf-44f1-b400-bc4a5ee190a3': { name: 'Aptos',         address: '' }, // APT,USDC,USDT
  '915f07a3-8a02-40f0-8f9d-b773b81c60a6': { name: 'AvalancheX',    address: '' }, // AVAX
  '66f6e5ed-5635-44eb-bc92-f4fcdbf66f1a': { name: 'Injective',     address: '' }, // INJ

  // --- Testnets ---
  'b7387cd9-2f47-4e4d-bc7b-d44e61d58210': { name: 'SolanaDevnet',  address: '' }, // DEVNETSOL,PYUSD,USDG
  '03b2d786-7092-4a6a-9737-d6013e21819b': { name: 'Sepolia',       address: '' }, // PYUSD,SEPOLIAETH,USDG
  'f2780a87-d1ab-4567-85b3-d9ae728cf54d': { name: 'Base Sepolia',  address: '' }, // EURC,LINK,SEPOLIAETH,USDC
};

/**
 * Resolve the merchant receiving address for a given network + token.
 * Returns the configured address string, or null when none is configured
 * (the caller should then fall back to a shopper-provided address).
 */
function resolveToAddress(networkId, symbol) {
  const entry = NETWORK_ADDRESSES[networkId];
  if (!entry) return null;
  if (symbol && entry.tokens && entry.tokens[symbol]) {
    return entry.tokens[symbol] || null;
  }
  return entry.address || null;
}

module.exports = { NETWORK_ADDRESSES, resolveToAddress };
