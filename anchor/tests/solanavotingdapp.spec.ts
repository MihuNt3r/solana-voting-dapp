import * as anchor from '@coral-xyz/anchor'
import { Program } from '@coral-xyz/anchor'
import { Keypair } from '@solana/web3.js'
import { Solanavotingdapp } from '../target/types/solanavotingdapp'

describe('solanavotingdapp', () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env()
  anchor.setProvider(provider)
  const payer = provider.wallet as anchor.Wallet

  const program = anchor.workspace.Solanavotingdapp as Program<Solanavotingdapp>

  const solanavotingdappKeypair = Keypair.generate()

  it('Initialize Solanavotingdapp', async () => {
    await program.methods
      .initialize()
      .accounts({
        solanavotingdapp: solanavotingdappKeypair.publicKey,
        payer: payer.publicKey,
      })
      .signers([solanavotingdappKeypair])
      .rpc()

    const currentCount = await program.account.solanavotingdapp.fetch(solanavotingdappKeypair.publicKey)

    expect(currentCount.count).toEqual(0)
  })

  it('Increment Solanavotingdapp', async () => {
    await program.methods.increment().accounts({ solanavotingdapp: solanavotingdappKeypair.publicKey }).rpc()

    const currentCount = await program.account.solanavotingdapp.fetch(solanavotingdappKeypair.publicKey)

    expect(currentCount.count).toEqual(1)
  })

  it('Increment Solanavotingdapp Again', async () => {
    await program.methods.increment().accounts({ solanavotingdapp: solanavotingdappKeypair.publicKey }).rpc()

    const currentCount = await program.account.solanavotingdapp.fetch(solanavotingdappKeypair.publicKey)

    expect(currentCount.count).toEqual(2)
  })

  it('Decrement Solanavotingdapp', async () => {
    await program.methods.decrement().accounts({ solanavotingdapp: solanavotingdappKeypair.publicKey }).rpc()

    const currentCount = await program.account.solanavotingdapp.fetch(solanavotingdappKeypair.publicKey)

    expect(currentCount.count).toEqual(1)
  })

  it('Set solanavotingdapp value', async () => {
    await program.methods.set(42).accounts({ solanavotingdapp: solanavotingdappKeypair.publicKey }).rpc()

    const currentCount = await program.account.solanavotingdapp.fetch(solanavotingdappKeypair.publicKey)

    expect(currentCount.count).toEqual(42)
  })

  it('Set close the solanavotingdapp account', async () => {
    await program.methods
      .close()
      .accounts({
        payer: payer.publicKey,
        solanavotingdapp: solanavotingdappKeypair.publicKey,
      })
      .rpc()

    // The account should no longer exist, returning null.
    const userAccount = await program.account.solanavotingdapp.fetchNullable(solanavotingdappKeypair.publicKey)
    expect(userAccount).toBeNull()
  })
})
