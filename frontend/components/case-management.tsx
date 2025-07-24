interface AuthUser {
  id: number | string;
  name: string;
  email?: string;
  // Add other fields as needed
}
"use client"

// TypeScript interfaces
interface Contact {
  id: number | string;
  name: string;
  company?: string;
  email?: string;
}

interface Case {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  assignee: { name: string; id: string };
  contact: { name: string; company: string; email: string };
  created: string;
  updated: string;
  category: string;
  responses: Array<{
    id: number;
    author: string;
    message: string;
    timestamp: string;
    type: string;
  }>;
}

interface NewCase {
  case_number: string;
  title: string;
  description: string;
  case_type: string;
  status: string;
  priority: string;
  client: string;
  assigned_lawyer: string;
  team_members: string[];
  court: string;
  judge: string;
  opposing_counsel: string;
  statute_of_limitations: string;
}

import { useState } from "react"
import { Plus, Search, Filter, MoreHorizontal, AlertTriangle, CheckCircle, FileText, Send, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { toast } from "@/hooks/use-toast" // Import toast
import { triggerInAppNotification } from "@/actions/notifications" // Import notification trigger

const cases = [
  {
    id: "CASE-001",
    title: "Server downtime issue",
    description: "Customer reporting intermittent server connectivity issues affecting their operations.",
    status: "In Progress",
    priority: "High",
    assignee: { name: "John Smith", id: "user1" },
    contact: { name: "Alice Johnson", company: "TechCorp Inc.", email: "alice@techcorp.com" },
    created: "2024-01-15",
    updated: "2024-01-16",
    category: "Technical",
    responses: [
      {
        id: 1,
        author: "John Smith",
        message: "Investigating the issue",
        timestamp: "2024-01-15 10:30",
        type: "internal",
      },
      {
        id: 2,
        author: "System",
        message: "Case assigned to John Smith",
        timestamp: "2024-01-15 09:00",
        type: "system",
      },
    ],
  },
  {
    id: "CASE-002",
    title: "Email configuration problem",
    description: "Unable to configure email settings for new domain setup.",
    status: "Under Review",
    priority: "Medium",
    assignee: { name: "Sarah Johnson", id: "user2" },
    contact: { name: "Bob Wilson", company: "ABC Corp", email: "bob@abccorp.com" },
    created: "2024-01-14",
    updated: "2024-01-15",
    category: "Configuration",
    responses: [],
  },
]

const users = [
  { id: "user1", name: "John Smith", role: "Technical Support" },
  { id: "user2", name: "Sarah Johnson", role: "System Admin" },
  { id: "user3", name: "Mike Wilson", role: "Senior Developer" },
  { id: "user4", name: "Lisa Chen", role: "Support Manager" },
]

export default function CaseManagement() {
  const [selectedCase, setSelectedCase] = useState<Case | null>(null)
  const [newCaseOpen, setNewCaseOpen] = useState<boolean>(false)
  const [responseText, setResponseText] = useState<string>("")
  const [newCase, setNewCase] = useState<NewCase>({
    case_number: "", // required, unique
    title: "",
    description: "",
    case_type: "other", // must match choices
    status: "open", // default
    priority: "medium", // must match choices
    client: "", // Contact ID
    assigned_lawyer: "", // Contact ID (from contacts API)
    team_members: [], // List of User IDs
    court: "",
    judge: "",
    opposing_counsel: "",
    statute_of_limitations: "", // date string
  })
  const [contacts, setContacts] = useState<Contact[]>([])
  const [authUsers, setAuthUsers] = useState<AuthUser[]>([])
  // Fetch auth users for assigned lawyer dropdown
  const fetchAuthUsers = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/api/users/", {
        credentials: "include"
      })
      if (!response.ok) throw new Error("Failed to fetch users")
      const data = await response.json()
      console.log("Fetched users from /api/users/:", data)
      let usersList: AuthUser[] = []
      if (Array.isArray(data)) {
        usersList = data
      } else if (data && Array.isArray(data.results)) {
        usersList = data.results
      } else {
        toast({
          title: "No Users Returned",
          description: "The /api/users/ endpoint did not return a user list. Check your backend.",
          variant: "destructive",
        })
      }
      setAuthUsers(usersList)
    } catch (error) {
      toast({
        title: "Error Fetching Users",
        description: error instanceof Error ? error.message : "Could not fetch users.",
        variant: "destructive",
      })
    }
  }
  // Fetch contacts from backend when dialog opens
  const fetchContacts = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/api/contacts/")
      if (!response.ok) throw new Error("Failed to fetch contacts")
      const data = await response.json()
      setContacts(data)
    } catch (error) {
      toast({
        title: "Error Fetching Contacts",
        description: error instanceof Error ? error.message : "Could not fetch contacts.",
        variant: "destructive",
      })
    }
  }
  // Open dialog and fetch contacts and users
  const handleOpenChange = (open: boolean) => {
    setNewCaseOpen(open)
    if (open) {
      fetchContacts()
      fetchAuthUsers()
    }
  }

  const handleCreateCase = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/api/cases/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newCase),
      })
      if (!response.ok) {
        let errorMsg = "Failed to create case."
        try {
          const errorData = await response.json()
          errorMsg = JSON.stringify(errorData)
        } catch (e) {}
        toast({
          title: "Error Creating Case",
          description: errorMsg,
          variant: "destructive",
        })
        return
      }
      const createdCase = await response.json()
      setNewCaseOpen(false)
      setNewCase({
        case_number: "",
        title: "",
        description: "",
        case_type: "other",
        status: "open",
        priority: "medium",
        client: "",
        assigned_lawyer: "",
        team_members: [],
        court: "",
        judge: "",
        opposing_counsel: "",
        statute_of_limitations: "",
      })
      toast({
        title: "Case Created",
        description: `Case "${createdCase.title}" has been registered.`,
      })
      triggerInAppNotification(`New case created: ${createdCase.title} (Priority: ${createdCase.priority})`)
    } catch (error) {
      let msg = "Could not connect to the server."
      if (error instanceof Error) msg = error.message
      toast({
        title: "Network Error",
        description: msg,
        variant: "destructive",
      })
    }
  }

  const handleAssignCase = (caseId: string, userId: string) => {
    // Implementation for assigning case
    console.log("Assigning case", caseId, "to user", userId)
    toast({
      title: "Case Reassigned",
      description: `Case ${caseId} has been reassigned.`,
    })
    const assignedUser = users.find((u) => u.id === userId)?.name || "unknown user"
    triggerInAppNotification(`Case ${caseId} reassigned to ${assignedUser}.`)
  }

  const handleEscalateCase = (caseId: string) => {
    // Implementation for escalating case
    console.log("Escalating case", caseId)
    toast({
      title: "Case Escalated",
      description: `Case ${caseId} has been escalated.`,
      variant: "destructive",
    })
    triggerInAppNotification(`Case ${caseId} has been escalated!`)
  }

  const handleAddResponse = (caseId: string) => {
    // Implementation for adding response
    console.log("Adding response to case", caseId, ":", responseText)
    setResponseText("")
    toast({
      title: "Response Added",
      description: `Response added to case ${caseId}.`,
    })
    triggerInAppNotification(`New response added to case ${caseId}.`)
  }

  const handleCloseCase = (caseId: string) => {
    // Implementation for closing case
    console.log("Closing case", caseId)
    toast({
      title: "Case Closed",
      description: `Case ${caseId} has been closed.`,
    })
    triggerInAppNotification(`Case ${caseId} has been closed.`)
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "destructive"
      case "Medium":
        return "secondary"
      case "Low":
        return "outline"
      default:
        return "outline"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Resolved":
        return "default"
      case "In Progress":
        return "secondary"
      case "Under Review":
        return "outline"
      case "Escalated":
        return "destructive"
      default:
        return "outline"
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Case Management</h1>
          <p className="text-muted-foreground">Register, assign, and manage customer support cases</p>
        </div>

        <Dialog open={newCaseOpen} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Case
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Case</DialogTitle>
              <DialogDescription>Register a new customer support case</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="case_number">Case Number</Label>
                  <Input
                    id="case_number"
                    value={newCase.case_number}
                    onChange={(e) => setNewCase({ ...newCase, case_number: e.target.value })}
                    placeholder="Unique case number (e.g. CASE-003)"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="title">Case Title</Label>
                  <Input
                    id="title"
                    value={newCase.title}
                    onChange={(e) => setNewCase({ ...newCase, title: e.target.value })}
                    placeholder="Brief description of the issue"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newCase.description}
                  onChange={(e) => setNewCase({ ...newCase, description: e.target.value })}
                  placeholder="Detailed description of the issue..."
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={newCase.priority}
                    onValueChange={(value) => setNewCase({ ...newCase, priority: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="case_type">Case Type</Label>
                  <Select
                    value={newCase.case_type}
                    onValueChange={(value) => setNewCase({ ...newCase, case_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="litigation">Litigation</SelectItem>
                      <SelectItem value="corporate">Corporate</SelectItem>
                      <SelectItem value="family">Family Law</SelectItem>
                      <SelectItem value="criminal">Criminal</SelectItem>
                      <SelectItem value="immigration">Immigration</SelectItem>
                      <SelectItem value="real_estate">Real Estate</SelectItem>
                      <SelectItem value="personal_injury">Personal Injury</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="client">Client (Contact ID)</Label>
                  <Input
                    id="client"
                    value={newCase.client}
                    onChange={(e) => setNewCase({ ...newCase, client: e.target.value })}
                    placeholder="Contact ID (number)"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="assigned_lawyer">Assigned Lawyer (User)</Label>
                  {authUsers.length === 0 ? (
                    <div className="text-sm text-muted-foreground">No users found</div>
                  ) : (
                    <Select
                      value={newCase.assigned_lawyer}
                      onValueChange={(value) => setNewCase({ ...newCase, assigned_lawyer: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select user" />
                      </SelectTrigger>
                      <SelectContent>
                        {authUsers.map((user: AuthUser) => (
                          <SelectItem key={user.id} value={user.id.toString()}>
                            {user.name} {user.email ? `(${user.email})` : ""}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="team_members">Team Members (User IDs, comma separated)</Label>
                  <Input
                    id="team_members"
                    value={newCase.team_members.join(",")}
                    onChange={(e) => setNewCase({ ...newCase, team_members: e.target.value.split(",") as string[] })}
                    placeholder="user1,user2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="court">Court</Label>
                  <Input
                    id="court"
                    value={newCase.court}
                    onChange={(e) => setNewCase({ ...newCase, court: e.target.value })}
                    placeholder="Court name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="judge">Judge</Label>
                  <Input
                    id="judge"
                    value={newCase.judge}
                    onChange={(e) => setNewCase({ ...newCase, judge: e.target.value })}
                    placeholder="Judge name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="opposing_counsel">Opposing Counsel</Label>
                  <Input
                    id="opposing_counsel"
                    value={newCase.opposing_counsel}
                    onChange={(e) => setNewCase({ ...newCase, opposing_counsel: e.target.value })}
                    placeholder="Opposing counsel name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="statute_of_limitations">Statute of Limitations</Label>
                  <Input
                    id="statute_of_limitations"
                    type="date"
                    value={newCase.statute_of_limitations}
                    onChange={(e) => setNewCase({ ...newCase, statute_of_limitations: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setNewCaseOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateCase}>Create Case</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Cases List and Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cases List */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Active Cases</CardTitle>
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input placeholder="Search cases..." className="pl-10 w-64" />
                  </div>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {cases.map((case_) => (
                  <div
                    key={case_.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedCase?.id === case_.id ? "border-blue-500 bg-blue-50" : "hover:bg-gray-50"
                    }`}
                    onClick={() => setSelectedCase(case_)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold">{case_.title}</h3>
                          <Badge variant={getPriorityColor(case_.priority)}>{case_.priority}</Badge>
                          <Badge variant={getStatusColor(case_.status)}>{case_.status}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {case_.id} • {case_.contact.name} ({case_.contact.company})
                        </p>
                        <p className="text-sm text-gray-600 line-clamp-2">{case_.description}</p>
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <span>Created: {case_.created}</span>
                          <span>Assigned: {case_.assignee.name}</span>
                        </div>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleAssignCase(case_.id, "user3")}>
                            <User className="h-4 w-4 mr-2" />
                            Reassign
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEscalateCase(case_.id)}>
                            <AlertTriangle className="h-4 w-4 mr-2" />
                            Escalate
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleCloseCase(case_.id)}>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Close Case
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Case Details */}
        <div className="space-y-4">
          {selectedCase ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Case Details
                    <Badge variant={getStatusColor(selectedCase.status)}>{selectedCase.status}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold">{selectedCase.title}</h3>
                    <p className="text-sm text-muted-foreground">{selectedCase.id}</p>
                  </div>

                  <div className="space-y-2">
                    <Label>Description</Label>
                    <p className="text-sm">{selectedCase.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <Label>Priority</Label>
                      <p>{selectedCase.priority}</p>
                    </div>
                    <div>
                      <Label>Category</Label>
                      <p>{selectedCase.category}</p>
                    </div>
                    <div>
                      <Label>Contact</Label>
                      <p>{selectedCase.contact.name}</p>
                      <p className="text-muted-foreground">{selectedCase.contact.email}</p>
                    </div>
                    <div>
                      <Label>Assignee</Label>
                      <p>{selectedCase.assignee.name}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Case Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {selectedCase.responses.map((response) => (
                      <div key={response.id} className="flex space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            {response.author
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center space-x-2">
                            <p className="text-sm font-medium">{response.author}</p>
                            <p className="text-xs text-muted-foreground">{response.timestamp}</p>
                          </div>
                          <p className="text-sm">{response.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 space-y-2">
                    <Textarea
                      placeholder="Add a response..."
                      value={responseText}
                      onChange={(e) => setResponseText(e.target.value)}
                      rows={3}
                    />
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" size="sm">
                        Internal Note
                      </Button>
                      <Button size="sm" onClick={() => handleAddResponse(selectedCase.id)}>
                        <Send className="h-4 w-4 mr-2" />
                        Send Response
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Select a case to view details</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
