'use client'

import { ATCScoreResult } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'

interface ATCScoreCardProps {
  result: ATCScoreResult
}

function getStatusColor(status: string) {
  switch (status) {
    case 'excellent': return 'bg-green-500'
    case 'good': return 'bg-blue-500'
    case 'average': return 'bg-yellow-500'
    case 'poor': return 'bg-red-500'
    default: return 'bg-gray-500'
  }
}

function getStatusBadgeVariant(status: string) {
  switch (status) {
    case 'excellent': return 'default' as const
    case 'good': return 'secondary' as const
    case 'average': return 'outline' as const
    case 'poor': return 'destructive' as const
    default: return 'outline' as const
  }
}

export default function ATCScoreCard({ result }: ATCScoreCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>ATC Score Report</span>
          <Badge variant="default" className="text-sm px-3 py-1">
            {result.grade}
          </Badge>
        </CardTitle>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>{result.breed}</span>
          <span>|</span>
          <span>{result.category}</span>
          <span>|</span>
          <span>Classification: {result.classificationConfidence}% confidence</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center p-6 bg-muted rounded-lg">
          <p className="text-5xl font-bold text-primary mb-2">{result.overallScore}</p>
          <p className="text-sm text-muted-foreground">out of 100</p>
          <Badge variant={getStatusBadgeVariant(result.overallScore >= 70 ? 'excellent' : result.overallScore >= 50 ? 'average' : 'poor')} className="mt-2">
            {result.grade}
          </Badge>
        </div>

        <Separator />

        <div className="space-y-4">
          {result.traits.map((trait) => (
            <div key={trait.trait}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">{trait.trait}</span>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">
                    {trait.value} / {trait.ideal}
                  </span>
                  <span className="text-sm font-bold w-10 text-right">{trait.score}</span>
                  <Badge variant={getStatusBadgeVariant(trait.status)} className="w-20 justify-center">
                    {trait.status}
                  </Badge>
                </div>
              </div>
              <Progress
                value={trait.score}
                className={`h-2 ${getStatusColor(trait.status)}`}
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
