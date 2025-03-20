// Here we export some useful types and functions for interacting with the Anchor program.
import { AnchorProvider, Program } from '@coral-xyz/anchor'
import { Cluster, PublicKey } from '@solana/web3.js'
import SolanavotingdappIDL from '../target/idl/solanavotingdapp.json'
import type { Solanavotingdapp } from '../target/types/solanavotingdapp'

// Re-export the generated IDL and type
export { Solanavotingdapp, SolanavotingdappIDL }

// The programId is imported from the program IDL.
export const SOLANAVOTINGDAPP_PROGRAM_ID = new PublicKey(SolanavotingdappIDL.address)

// This is a helper function to get the Solanavotingdapp Anchor program.
export function getSolanavotingdappProgram(provider: AnchorProvider, address?: PublicKey) {
  return new Program({ ...SolanavotingdappIDL, address: address ? address.toBase58() : SolanavotingdappIDL.address } as Solanavotingdapp, provider)
}

// This is a helper function to get the program ID for the Solanavotingdapp program depending on the cluster.
export function getSolanavotingdappProgramId(cluster: Cluster) {
  switch (cluster) {
    case 'devnet':
    case 'testnet':
      // This is the program ID for the Solanavotingdapp program on devnet and testnet.
      return new PublicKey('coUnmi3oBUtwtd9fjeAvSsJssXh5A5xyPbhpewyzRVF')
    case 'mainnet-beta':
    default:
      return SOLANAVOTINGDAPP_PROGRAM_ID
  }
}
