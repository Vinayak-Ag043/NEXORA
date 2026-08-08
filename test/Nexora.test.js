const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('Nexora', function () {
  async function deploy() { const [creator, member, outsider] = await ethers.getSigners(); const Nexora = await ethers.getContractFactory('Nexora'); return { nexora: await Nexora.deploy(), creator, member, outsider }; }
  it('creates a group and makes its creator a member', async function () { const { nexora, creator } = await deploy(); await nexora.createGroup('Lab', 'Materials'); const group = await nexora.getGroup(1); expect(group.creator).to.equal(creator.address); expect(group.memberCount).to.equal(1); expect(await nexora.isGroupMember(1, creator.address)).to.equal(true); });
  it('prevents joining the same group twice', async function () { const { nexora } = await deploy(); await nexora.createGroup('Lab', ''); await expect(nexora.joinGroup(1)).to.be.revertedWithCustomError(nexora, 'AlreadyMember'); });
  it('allows members to create and cast one vote on a proposal', async function () { const { nexora, member } = await deploy(); await nexora.createGroup('Lab', ''); await nexora.connect(member).joinGroup(1); await nexora.createProposal(1, 'Buy printer', '', 300); await nexora.connect(member).vote(1, true); expect((await nexora.getProposal(1)).yesCount).to.equal(1); await expect(nexora.connect(member).vote(1, false)).to.be.revertedWithCustomError(nexora, 'AlreadyVoted'); });
  it('requires membership and validates voting duration', async function () { const { nexora, outsider } = await deploy(); await nexora.createGroup('Lab', ''); await expect(nexora.connect(outsider).createProposal(1, 'Nope', '', 300)).to.be.revertedWithCustomError(nexora, 'NotGroupMember'); await expect(nexora.createProposal(1, 'Too short', '', 299)).to.be.revertedWithCustomError(nexora, 'InvalidDuration'); });
});
