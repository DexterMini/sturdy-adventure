import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Users, Bot, Zap, Activity, Plus, Play, CheckCircle, Clock, AlertCircle, Moon, Sun } from 'lucide-react'
import './App.css'

function App() {
  const [agents, setAgents] = useState([])
  const [tasks, setTasks] = useState([])
  const [orchestratorStatus, setOrchestratorStatus] = useState(null)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskDescription, setNewTaskDescription] = useState('')
  const [newTaskType, setNewTaskType] = useState('')
  const [analysisRequest, setAnalysisRequest] = useState(null)
  const [analysisResult, setAnalysisResult] = useState(null)
  const [darkMode, setDarkMode] = useState(true)

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [darkMode])

  const API_BASE = 'https://ogh5izc8pk7v.manus.space/api'

  useEffect(() => {
    fetchAgents()
    fetchTasks()
    fetchOrchestratorStatus()
  }, [])

  const fetchAgents = async () => {
    try {
      const response = await fetch(`${API_BASE}/agents`)
      const data = await response.json()
      setAgents(data)
    } catch (error) {
      console.error("Error fetching agents:", error)
    }
  }

  const fetchTasks = async () => {
    try {
      const response = await fetch(`${API_BASE}/tasks`)
      const data = await response.json()
      setTasks(data)
    } catch (error) {
      console.error("Error fetching tasks:", error)
    }
  }

  const fetchOrchestratorStatus = async () => {
    try {
      const response = await fetch(`${API_BASE}/orchestrator/status`)
      const data = await response.json()
      setOrchestratorStatus(data)
    } catch (error) {
      console.error("Error fetching orchestrator status:", error)
    }
  }

  const createTask = async () => {
    if (!newTaskTitle || !newTaskType) return

    try {
      const response = await fetch(`${API_BASE}/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: newTaskTitle,
          description: newTaskDescription,
          task_type: newTaskType,
          priority: 2
        })
      })

      if (response.ok) {
        setNewTaskTitle("")
        setNewTaskDescription("")
        setNewTaskType("")
        fetchTasks()
        fetchAgents()
      }
    } catch (error) {
      console.error("Error creating task:", error)
    }
  }

  const executeTask = async (taskId) => {
    try {
      const response = await fetch(`${API_BASE}/tasks/${taskId}/execute`, {
        method: "POST"
      })

      if (response.ok) {
        fetchTasks()
        fetchAgents()
      }
    } catch (error) {
      console.error("Error executing task:", error)
    }
  }

  const analyzeRequest = async () => {
    if (!analysisRequest) return

    try {
      const response = await fetch(`${API_BASE}/orchestrator/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          request: analysisRequest
        })
      })

      const data = await response.json()
      setAnalysisResult(data)
    } catch (error) {
      console.error("Error analyzing request:", error)
    }
  }

  const executePlan = async (suggestedTasks) => {
    try {
      const response = await fetch(`${API_BASE}/orchestrator/execute-plan`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tasks: suggestedTasks
        })
      })

      if (response.ok) {
        setAnalysisResult(null)
        setAnalysisRequest("")
        fetchTasks()
        fetchAgents()
      }
    } catch (error) {
      console.error("Error executing plan:", error)
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "in_progress":
        return <Clock className="h-4 w-4 text-blue-500" />
      case "failed":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getAgentStatusColor = (status) => {
    switch (status) {
      case "idle":
        return "bg-green-500 text-white"
      case "busy":
        return "bg-blue-500 text-white"
      case "error":
        return "bg-red-500 text-white"
      default:
        return "bg-gray-500 text-white"
    }
  }

  const getTaskTypeLabel = (type) => {
    const types = {
      "text": "Tekstgenerering",
      "visual": "Visuelt innhold",
      "code": "Koding & integrasjon",
      "workflow": "Workflow",
      "customer_service": "Kundeservice",
      "sales": "Salg & markedsføring"
    }
    return types[type] || type
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 flex justify-between items-center bg-gradient-to-r from-blue-800 to-purple-900 text-white p-6 rounded-lg shadow-lg">
          <div>
            <h1 className="text-4xl font-bold mb-2">Nordic AI</h1>
            <p className="text-lg">Koordinert AI-team system for sømløst samarbeid</p>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setDarkMode(!darkMode)} className="text-white hover:bg-blue-700">
            {darkMode ? <Sun className="h-6 w-6" /> : <Moon className="h-6 w-6" />}
          </Button>
        </header>

        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="agents" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              AI-agenter
            </TabsTrigger>
            <TabsTrigger value="tasks" className="flex items-center gap-2">
              <Bot className="h-4 w-4" />
              Oppgaver
            </TabsTrigger>
            <TabsTrigger value="orchestrator" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Orkestrering
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-gray-800 text-white border border-blue-700 shadow-lg hover:shadow-blue-500/50 transition-all duration-300 ease-in-out transform hover:-translate-y-1">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Totale agenter</CardTitle>
                  <Users className="h-4 w-4 text-blue-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{agents.length}</div>
                  <p className="text-xs text-gray-400">
                    {agents.filter(a => a.status === 'idle').length} tilgjengelige
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 text-white border border-blue-700 shadow-lg hover:shadow-blue-500/50 transition-all duration-300 ease-in-out transform hover:-translate-y-1">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Aktive oppgaver</CardTitle>
                  <Bot className="h-4 w-4 text-blue-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {tasks.filter(t => t.status === 'in_progress').length}
                  </div>
                  <p className="text-xs text-gray-400">
                    {tasks.filter(t => t.status === 'pending').length} ventende
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 text-white border border-blue-700 shadow-lg hover:shadow-blue-500/50 transition-all duration-300 ease-in-out transform hover:-translate-y-1">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Fullførte oppgaver</CardTitle>
                  <CheckCircle className="h-4 w-4 text-blue-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {tasks.filter(t => t.status === 'completed').length}
                  </div>
                  <p className="text-xs text-gray-400">
                    {tasks.filter(t => t.status === 'failed').length} feilet
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-gray-800 text-white border border-blue-700 shadow-lg hover:shadow-blue-500/50 transition-all duration-300 ease-in-out">
              <CardHeader>
                <CardTitle>Siste aktivitet</CardTitle>
                <CardDescription className="text-gray-400">Nylige oppgaver og statusoppdateringer</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {tasks.slice(0, 5).map((task) => (
                    <div key={task.id} className="flex items-center justify-between p-3 border border-gray-700 rounded-lg bg-gray-900 hover:bg-gray-800 transition-colors duration-200">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(task.status)}
                        <div>
                          <p className="font-medium">{task.title}</p>
                          <p className="text-sm text-gray-400">{getTaskTypeLabel(task.task_type)}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="bg-gray-700 text-gray-200 border-gray-600">{task.status}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="agents" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {agents.map((agent) => (
                <Card key={agent.id} className="bg-gray-800 text-white border border-blue-700 shadow-lg hover:shadow-blue-500/50 transition-all duration-300 ease-in-out transform hover:-translate-y-1">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{agent.name}</CardTitle>
                      <Badge className={getAgentStatusColor(agent.status)}>
                        {agent.status}
                      </Badge>
                    </div>
                    <CardDescription className="text-gray-400">{getTaskTypeLabel(agent.type)}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-400 mb-4">{agent.description}</p>
                    <div className="space-y-2">
                      <div className="text-xs text-gray-400">
                        <strong>Språk:</strong> {agent.capabilities.languages?.join(", ") || "N/A"}
                      </div>
                      <div className="text-xs text-gray-400">
                        <strong>Tilgjengelighet:</strong> {agent.capabilities.availability || "N/A"}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="tasks" className="space-y-6">
            <Card className="bg-gray-800 text-white border border-blue-700 shadow-lg hover:shadow-blue-500/50 transition-all duration-300 ease-in-out">
              <CardHeader>
                <CardTitle>Opprett ny oppgave</CardTitle>
                <CardDescription className="text-gray-400">Legg til en ny oppgave for AI-teamet</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    placeholder="Oppgavetittel"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                  />
                  <Select value={newTaskType} onValueChange={setNewTaskType}>
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                      <SelectValue placeholder="Velg oppgavetype" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-700 text-white">
                      <SelectItem value="text">Tekstgenerering</SelectItem>
                      <SelectItem value="visual">Visuelt innhold</SelectItem>
                      <SelectItem value="code">Koding & integrasjon</SelectItem>
                      <SelectItem value="workflow">Workflow</SelectItem>
                      <SelectItem value="customer_service">Kundeservice</SelectItem>
                      <SelectItem value="sales">Salg & markedsføring</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Textarea
                  placeholder="Oppgavebeskrivelse"
                  value={newTaskDescription}
                  onChange={(e) => setNewTaskDescription(e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                />
                <Button onClick={createTask} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Opprett oppgave
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 text-white border border-blue-700 shadow-lg hover:shadow-blue-500/50 transition-all duration-300 ease-in-out">
              <CardHeader>
                <CardTitle>Oppgaver</CardTitle>
                <CardDescription className="text-gray-400">Alle oppgaver i systemet</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {tasks.map((task) => (
                    <div key={task.id} className="flex items-center justify-between p-4 border border-gray-700 rounded-lg bg-gray-900 hover:bg-gray-800 transition-colors duration-200">
                      <div className="flex items-center gap-4">
                        {getStatusIcon(task.status)}
                        <div>
                          <h3 className="font-medium">{task.title}</h3>
                          <p className="text-sm text-gray-400">{task.description}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="bg-gray-700 text-gray-200 border-gray-600">{getTaskTypeLabel(task.task_type)}</Badge>
                            <Badge variant="outline" className="bg-gray-700 text-gray-200 border-gray-600">Prioritet {task.priority}</Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={task.status === 'completed' ? 'bg-green-500 text-white' :
                                        task.status === 'failed' ? 'bg-red-500 text-white' :
                                        'bg-blue-500 text-white'}>
                          {task.status}
                        </Badge>
                        {task.status === 'pending' && (
                          <Button size="sm" onClick={() => executeTask(task.id)} className="bg-blue-600 hover:bg-blue-700 text-white">
                            <Play className="h-4 w-4 mr-1" />
                            Utfør
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orchestrator" className="space-y-6">
            <Card className="bg-gray-800 text-white border-gray-700 shadow-xl">
              <CardHeader>
                <CardTitle>Intelligent oppgaveanalyse</CardTitle>
                <CardDescription className="text-gray-400">
                  Beskriv hva du ønsker å oppnå, så vil AI-teamet analysere og foreslå en koordinert tilnærming
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Beskriv ditt prosjekt eller mål. For eksempel: 'Jeg trenger en markedsføringskampanje for mitt nye produkt med tekst, bilder og automatiserte arbeidsflyter...'
                  value={analysisRequest}
                  onChange={(e) => setAnalysisRequest(e.target.value)}
                  rows={4}
                  className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                />
                <Button onClick={analyzeRequest} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                  <Zap className="h-4 w-4 mr-2" />
                  Analyser forespørsel
                </Button>
              <Card className="bg-gray-800 text-white border-gray-700 shadow-xl">
                <CardHeader>
                  <CardTitle>Foreslått koordinert plan</CardTitle>
                  <CardDescription className="text-gray-400">
                    Basert på din forespørsel har AI-teamet foreslått følgende tilnærming
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-blue-900 rounded-lg text-blue-100">
                    <h4 className="font-medium mb-2">Analyse:</h4>
                    <p>{analysisResult.analysis}</p>
                  </div>
                  <h4 className="font-medium text-lg">Foreslåtte oppgaver:</h4>
                  <div className="space-y-3">
                    {analysisResult.suggested_tasks.map((task, index) => (
                      <div key={index} className="p-3 border border-gray-700 rounded-lg bg-gray-900">
                        <p className="font-medium">{task.title}</p>
                        <p className="text-sm text-gray-400">{task.description}</p>
                        <Badge variant="outline" className="mt-1 bg-gray-700 text-gray-200 border-gray-600">{getTaskTypeLabel(task.task_type)}</Badge>
                      </div>
                    ))}
                  </div>
                  <Button onClick={() => executePlan(analysisResult.suggested_tasks)} className="w-full bg-green-600 hover:bg-green-700 text-white">
                    <Play className="h-4 w-4 mr-2" />
                    Utfør koordinert plan
                  </Button>
                </CardContent>
              </Card>
            )}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-medium mb-2">Koordineringsstrategi:</h4>
                    <p className="text-sm text-gray-700">{analysisResult.coordination_strategy}</p>
                  </div>

                  <Button 
                    onClick={() => executePlan(analysisResult.suggested_tasks)} 
                    className="w-full"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Utfør koordinert plan
                  </Button>
                </CardContent>
              </Card>
            )}

            {orchestratorStatus && (
              <Card>
                <CardHeader>
                  <CardTitle>Systemstatus</CardTitle>
                  <CardDescription>Oversikt over AI-teamets nåværende tilstand</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-3">Agent-statistikk</h4>
                      <div className="space-y-2">
                        {Object.entries(orchestratorStatus.agent_statistics || {}).map(([status, count]) => (
                          <div key={status} className="flex justify-between">
                            <span className="capitalize">{status}:</span>
                            <Badge variant="outline">{count}</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-3">Oppgave-statistikk</h4>
                      <div className="space-y-2">
                        {Object.entries(orchestratorStatus.task_statistics || {}).map(([status, count]) => (
                          <div key={status} className="flex justify-between">
                            <span className="capitalize">{status}:</span>
                            <Badge variant="outline">{count}</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default App

