import './MessageAIBadge.css'

function MessageAIBadge({ type, data, onClick }) {
  if (!data) return null

  const getBadgeContent = () => {
    if (type === 'closure') {
      return {
        icon: '🎯',
        label: data.maxSimilarity?.toFixed(2) || '0.00',
        className: 'closure-badge',
        title: 'Closure detected - Click for details'
      }
    } else if (type === 'classification') {
      const classMap = {
        satisfied: { icon: '✅', label: 'Satisfied', className: 'satisfied-badge' },
        needs_help: { icon: '❓', label: 'Needs Help', className: 'needs-help-badge' },
        uncertain: { icon: '⚠️', label: 'Uncertain', className: 'uncertain-badge' }
      }
      const config = classMap[data.classification] || classMap.uncertain
      return {
        ...config,
        title: `Classified as ${data.classification} - Click for details`
      }
    }
    return null
  }

  const badgeInfo = getBadgeContent()
  if (!badgeInfo) return null

  return (
    <button
      className={`ai-badge ${badgeInfo.className}`}
      onClick={onClick}
      title={badgeInfo.title}
    >
      <span className="badge-icon">{badgeInfo.icon}</span>
      <span className="badge-label">{badgeInfo.label}</span>
    </button>
  )
}

export default MessageAIBadge
