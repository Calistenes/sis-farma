"use client";

import { useActionState, useState } from "react";
import { createTransaction, type TransactionFormState } from "./actions";
import { Button } from "@/components/ui/Button";
import { Input, Label, Select } from "@/components/ui/Input";
import type { Category, EntryType } from "@/lib/types";

const initialState: TransactionFormState = { error: null };

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function NewTransactionForm({ categories }: { categories: Category[] }) {
  const [state, formAction, pending] = useActionState(
    createTransaction,
    initialState
  );
  const [type, setType] = useState<EntryType>("income");

  const filteredCategories = categories.filter((c) => c.type === type);

  return (
    <form
      action={formAction}
      key={state.error ? "error" : "idle"}
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6"
    >
      <div className="lg:col-span-1">
        <Label htmlFor="type">Tipo</Label>
        <Select
          id="type"
          name="type"
          value={type}
          onChange={(e) => setType(e.target.value as EntryType)}
        >
          <option value="income">Receita</option>
          <option value="expense">Despesa</option>
        </Select>
      </div>
      <div className="lg:col-span-1">
        <Label htmlFor="amount">Valor (R$)</Label>
        <Input
          id="amount"
          name="amount"
          type="number"
          step="0.01"
          min="0.01"
          required
        />
      </div>
      <div className="lg:col-span-2">
        <Label htmlFor="description">Descrição</Label>
        <Input id="description" name="description" type="text" />
      </div>
      <div className="lg:col-span-1">
        <Label htmlFor="category_id">Categoria</Label>
        <Select id="category_id" name="category_id" defaultValue="">
          <option value="">Sem categoria</option>
          {filteredCategories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </Select>
      </div>
      <div className="lg:col-span-1">
        <Label htmlFor="occurred_on">Data</Label>
        <Input
          id="occurred_on"
          name="occurred_on"
          type="date"
          defaultValue={todayISO()}
          required
        />
      </div>
      <div className="flex items-end lg:col-span-6">
        <Button type="submit" disabled={pending}>
          {pending ? "Salvando..." : "Adicionar lançamento"}
        </Button>
      </div>
      {state.error && (
        <p className="text-sm text-red-600 lg:col-span-6">{state.error}</p>
      )}
    </form>
  );
}
