"use client"

import { Badge } from "@/components/ui/badge"
import { FileText, Users } from "lucide-react"
import Link from "next/link"

interface Activity {
  id: string
  type: "invoice" | "proposal" | "client"
  title: string
  status: string
  amount?: number
  date: string
}

interface ActivityFeedProps {
  activities: Activity[]
}

export default function ActivityFeed({ activities }: ActivityFeedProps) {
  const getStatusColor = (status: string, type: string) => {
    if (type === "invoice") {
      switch (status) {
        case "paid":
          return "bg-green-100 text-green-800"
        case "sent":
          return "bg-blue-100 text-blue-800"
        case "overdue":
          return "bg-red-100 text-red-800"
        case "draft":
          return "bg-gray-100 text-gray-800"
        default:
          return "bg-gray-100 text-gray-800"
      }
    } else {
      switch (status) {
        case "approved":
          return "bg-green-100 text-green-800"
        case "sent":
          return "bg-blue-100 text-blue-800"
        case "rejected":
          return "bg-red-100 text-red-800"
        case "expired":
          return "bg-orange-100 text-orange-800"
        case "draft":
          return "bg-gray-100 text-gray-800"
        default:
          return "bg-gray-100 text-gray-800"
      }
    }
  }

  const getIcon = (type: string) => {
    switch (type) {
      case "invoice":
      case "proposal":
        return <FileText className="h-4 w-4" />
      case "client":
        return <Users className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const getLink = (activity: Activity) => {
    switch (activity.type) {
      case "invoice":
        return `/dashboard/invoices/${activity.id}`
      case "proposal":
        return `/dashboard/proposals/${activity.id}`
      case "client":
        return `/dashboard/clients/${activity.id}`
      default:
        return "/dashboard"
    }
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-8">
        <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
        <p className="text-gray-500 text-sm">No recent activity</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {activities.map((activity) => (
        <Link key={activity.id} href={getLink(activity)} className="block">
          <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="flex-shrink-0 mt-0.5">{getIcon(activity.type)}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{activity.title}</p>
              <div className="flex items-center space-x-2 mt-1">
                <Badge className={getStatusColor(activity.status, activity.type)} variant="secondary">
                  {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
                </Badge>
                {activity.amount && (
                  <span className="text-sm text-gray-500">${Number(activity.amount).toLocaleString()}</span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">{new Date(activity.date).toLocaleDateString()}</p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
