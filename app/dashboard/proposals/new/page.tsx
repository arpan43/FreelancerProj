import ProposalForm from "@/components/proposal-form"

export default function NewProposalPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Create Proposal</h1>
        <p className="text-gray-600">Write a compelling proposal for your next project</p>
      </div>

      <ProposalForm />
    </div>
  )
}
