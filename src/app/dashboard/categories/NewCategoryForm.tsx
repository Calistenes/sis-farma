"use client";

import { useActionState } from "react";
import { createCategory, type CategoryFormState } from "./actions";
import { Button } from "@/components/ui/Button";
import { Input, Label, Select } from "@/components/ui/Input";

const initialState: CategoryFormState = { error: null };

export function NewCategoryForm() {
  const [state, formAction, pending] = useActionState(
    createCategory,
    initialState
  );

  return (
    <form
      action={formAction}
      key={state.error ? "error" : "idle"}
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5"
    >
      <div className="lg:col-span-2">
        <Label htmlFor="name">Nome</Label>
        <Input id="name" name="name" type="text" required />
      </div>
      <div>
        <Label htmlFor="type">Tipo</Label>
        <Select id="type" name="type" defaultValue="income">
          <option value="income">Receita</option>
          <option value="expense">Despesa</option>
        </Select>
      </div>
      <div>
        <Label htmlFor="color">Cor</Label>
        <Input
          id="color"
          name="color"
          type="color"
          defaultValue="#6366f1"
          className="h-10 p-1"
        />
      </div>
      <div className="flex items-end">
        <Button type="submit" disabled={pending} className="w-full">
          {pending ? "Salvando..." : "Adicionar"}
        </Button>
      </div>
      {state.error && (
        <p className="text-sm text-red-600 lg:col-span-5">{state.error}</p>
      )}
    </form>
  );
}
