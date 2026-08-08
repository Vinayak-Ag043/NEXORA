import React from "react";
import { motion } from "framer-motion";
import { Users, Vote, ShieldCheck } from "lucide-react";

const pillars = [
  {
    number: "01",
    icon: Users,
    title: "Trustless Group Coordination",
    description:
      "Form self-sovereign groups on-chain. Membership is permissionless, wallet-verified, and stored immutably without reliance on centralized admins.",
    accent: "violet",
  },
  {
    number: "02",
    icon: Vote,
    title: "On-Chain Voting & Proposals",
    description:
      "Group members can submit proposals with automated deadlines (5 mins to 30 days) and vote with 1-wallet-1-vote fairness.",
    accent: "cyan",
  },
  {
    number: "03",
    icon: ShieldCheck,
    title: "Verifiable On-Chain Provenance",
    description:
      "Every group creation, member join, proposal submission, and vote emits Ethereum smart contract events for transparent auditing.",
    accent: "emerald",
  },
];

function Pillars() {
  return (
    <section
      id="features"
      className="relative overflow-hidden bg-slate-950 px-6 py-28"
    >
      {/* Background Glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-600/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mx-auto max-w-3xl text-center"
        >
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-violet-400">
            The Nexora Architecture
          </p>

          <h2 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Decentralized Governance.
            <br />
            <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
              Your Rules. Your Voice.
            </span>
          </h2>

          <p className="mt-6 text-lg leading-8 text-slate-400">
            Nexora combines smart contract execution, membership validation, and on-chain
            provenance into one unified coordination layer.
          </p>
        </motion.div>

        {/* Feature Cards */}
        <div className="mt-16 grid gap-6 lg:grid-cols-3">
          {pillars.map((pillar, index) => {
            const Icon = pillar.icon;

            return (
              <motion.div
                key={pillar.number}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.6,
                  delay: index * 0.15,
                }}
                whileHover={{ y: -8 }}
                className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur-xl transition-colors hover:border-violet-400/30"
              >
                {/* Large Background Number */}
                <div className="absolute right-7 top-6 text-5xl font-bold text-white/[0.07]">
                  {pillar.number}
                </div>

                {/* Icon Box */}
                <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-500/10">
                  <Icon
                    size={28}
                    strokeWidth={1.6}
                    className="text-violet-300"
                  />
                </div>

                {/* Content */}
                <h3 className="text-2xl font-semibold text-white">
                  {pillar.title}
                </h3>

                <p className="mt-4 leading-7 text-slate-400">
                  {pillar.description}
                </p>

                {/* Bottom Divider Line */}
                <div className="mt-8 h-px w-full bg-gradient-to-r from-violet-500/40 via-cyan-400/20 to-transparent" />

                <a
                  href="#workspace"
                  className="mt-5 inline-block text-sm font-medium text-violet-300 hover:text-white transition"
                >
                  Explore capability →
                </a>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default Pillars;
