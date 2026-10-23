import { createFileRoute, Link } from "@tanstack/react-router";
import { Coins } from "lucide-react";
import type { ReactNode } from "react";
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TOKEN_ALLOCATION } from "@/lib/tokenomics";

export const Route = createFileRoute("/tokenomics")({
  head: () => ({
    meta: [
      { title: "Tokenomics — Rashito" },
      {
        name: "description",
        content: "RASH token allocation: 3,000,000 fixed supply, breakdown by bucket, and utility.",
      },
      { property: "og:title", content: "Tokenomics — Rashito" },
    ],
  }),
  component: TokenomicsPage,
});

const TOKEN_COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ec4899", "#06b6d4", "#a855f7"];

function DonutCard({
  title,
  icon,
  data,
  colors,
  centerLabel,
}: {
  title: string;
  icon: ReactNode;
  data: { name: string; value: number }[];
  colors: string[];
  centerLabel: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          {icon} {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative h-72">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius={70}
                outerRadius={110}
                paddingAngle={2}
              >
                {data.map((_, i) => (
                  <Cell key={i} fill={colors[i % colors.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center pb-9">
            <span className="text-xs text-muted-foreground">Total supply</span>
            <span className="text-lg font-bold">{centerLabel}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function TokenomicsPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <section className="mx-auto max-w-5xl px-4 py-10 sm:py-16">
        <Badge variant="outline" className="mb-4">
          Tokenomics
        </Badge>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          How RASH's supply is allocated
        </h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          RASH is a fixed-supply utility token: 3,000,000 tokens, minted once at deployment. The
          contract has no way to mint beyond that cap - see{" "}
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
            contracts/RashitoToken.sol
          </code>
          .
        </p>

        <div className="mt-8 grid gap-6 lg:grid-cols-2 sm:mt-10">
          <DonutCard
            title="RASH allocation"
            icon={<Coins className="size-4" />}
            data={TOKEN_ALLOCATION}
            colors={TOKEN_COLORS}
            centerLabel="3,000,000"
          />
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Key facts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                <b className="text-foreground">Fixed supply.</b> 3,000,000 RASH minted once at
                deployment. No mint function exists beyond that.
              </p>
              <p>
                <b className="text-foreground">Burnable.</b> Any holder can permanently burn their
                own tokens, reducing circulating supply over time.
              </p>
              <p>
                <b className="text-foreground">Utility (phased).</b> Fee discounts, governance,
                staking rewards, and marketplace credit - activated per the roadmap in the
                whitepaper.
              </p>
              <Button asChild variant="secondary" size="sm" className="mt-2">
                <Link to="/whitepaper">Read the full whitepaper</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-base">Allocation breakdown</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bucket</TableHead>
                  <TableHead>Share</TableHead>
                  <TableHead>RASH</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {TOKEN_ALLOCATION.map((row) => (
                  <TableRow key={row.name}>
                    <TableCell className="font-medium">{row.name}</TableCell>
                    <TableCell>{row.value}%</TableCell>
                    <TableCell className="font-mono text-xs">{row.tokens}</TableCell>
                    <TableCell className="text-muted-foreground">{row.note}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>
      <SiteFooter />
    </div>
  );
}
