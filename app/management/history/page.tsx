"use client"

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent
} from "@/components/ui/card"

import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell
} from "@/components/ui/table"

export default function HistoryPage() {
  const history = [
    {
      id: 1,
      days: "Monday 22/6/2026",
      items: [
        {
          "Meggie Kari": 20,
          "Meggis Ayam": 30,
          Ayam: 30
        }
      ]
    },
    {
      id: 2,
      days: "Tuesday 23/6/2026",
      items: [
        {
          "Kicap Souce": 20,
          "Berbaque souces": 30,
          "Tomato souces": 30
        }
      ]
    }
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">
        Inventory History
      </h1>

      {history.map((day) => (
        <Card key={day.id}>
          <CardHeader>
            <CardTitle>
              {day.days}
            </CardTitle>
          </CardHeader>

          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No.</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>In</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {Object.entries(day.items[0]).map(
                  ([name, quantity], index) => (
                    <TableRow key={name}>
                      <TableCell>
                        {index + 1}
                      </TableCell>
                      <TableCell>
                        {name}
                      </TableCell>
                      <TableCell>
                        {quantity}
                      </TableCell>
                    </TableRow>
                  )
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}