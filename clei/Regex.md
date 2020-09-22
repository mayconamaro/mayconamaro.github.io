---
title: Ferramenta Baseada em Derivadas para Parsing de ER’s
author: LiVES Research Group
date: 2020
---

Introdução
===

- Parsing: analisar se cadeias de símbolos correspondem a um conjunto de regra
  
  - construção da evidência

- Interesse em Linguagens Regulares (LRs) 
  
  - São denotadas por Expressões Regulares (REs)

Objetivo
===

1. Formalizar completamente um algoritmo de parsing de LRs usando derivadas

2. Descrever, uma ferramenta de busca baseada em REs usando Agda

Linguagens Regulares
===

Linguagens reconhecidas por um Automâto Finito (Não-)Determinístico

Expressões Regulares
===

- Representam LRs de forma algébrica e compacta 

$$e := \varnothing \; | \; \epsilon \; | \; a \; | \; e\:e \; | \; e+e \; | \; e^*$$

Construções
===

- $\epsilon \in \epsilon$, $a \in a$, $\epsilon \in e^*$
- Se $s \in e$ então $s \in e+e'$ e $s \in e'+e$
- Se $s_1 \in e_1$ e $s_2 \in e_2$ então $s_1\:s_2 \in e_1\:e_2$
- Se $s \in e$ e $s' \in e^*$ então $ss' \in e^*$

Agda
---

```haskell
data Regex : Set where 
  ∅ : Regex 
  ε : Regex 
  $_ : Char → Regex
  _•_ : Regex → Regex → Regex
  _+_ : Regex → Regex → Regex
  _* : Regex → Regex
```

Derivadas
===

- Formalmente, a derivada de uma linguagem $L$ com respeito à um símbolo $a$, são os sufixos das palavras de $L$ sem o prefixo $a$
  - Exemplo: a derivada de {bac, bdc, dadb} com b é {ac, dc, dadb}

Função $\nu$
===

- Um algoritmo para computar a derivada de uma ER
- Depende da função $\nu$ que verifica se a ER aceita $\epsilon$
$$
\begin{aligned}
  \nu(\varnothing) &= \varnothing \\
  \nu(\epsilon) &= \epsilon \\
  \nu(a) &= \varnothing \\
  \nu(e\:e') &= \epsilon \text{ se } \nu(e) \equiv \nu(e') \equiv \epsilon \text{, senao } \varnothing \\
  \nu(e+e') &= \epsilon \text{ se } \nu(e) \equiv \epsilon \text{ ou } \nu(e') \equiv \epsilon \text{, senao } \varnothing \\
  \nu(e^*) &= \epsilon
\end{aligned}
$$

Agda
---

```haskell
ν[_] : ∀ (e:Regex) → Dec ([] ∈ 〚e〛)
ν[ ∅ ] = no(λ())
ν[ ε ]  =yes ε
ν[ $ x]  =no(λ())
ν[ e•e′ ] with ν[e] | ν[e′]
...| yes pr | (yes pr1)  = yes (pr • pr1 ⇒ refl)
...| yes pr | (no ¬pr1)  = no (¬pr1 ◦ π2 ◦ •invert)
...| no ¬pr | pr1 = no (¬pr ◦ π1 ◦ •invert)
ν[e+e′] with ν[e] | ν[e′]
...| yes pr | pr1 = yes (e′ + L pr)
...| no ¬pr | (yes pr1)  = yes (e + R pr1)
...| no ¬pr | (no ¬pr1)
    = no([¬pr, ¬pr1] ◦ +invert)
ν[e*]  = yes (( e • e * + L ε) *)
```

Smart Constructors
===

- Um algoritmo para identificar ERs equivalentes a menos de $\epsilon$ e $\varnothing$
- $\approx$ denota equivalência

$$ 
\begin{equation*}
\begin{aligned}
e + \varnothing &\approx e \\
e \: \varnothing &\approx \varnothing \\
\varnothing \: e &\approx \varnothing \\
\varnothing^* &\approx \epsilon \\
\end{aligned}
\qquad
\begin{aligned}
\varnothing + e &\approx e \\
e \: \epsilon &\approx e \\
\epsilon \: e &\approx e \\
\epsilon^* &\approx \epsilon
\end{aligned}
\end{equation*}
$$

Agda
---

```haskell
_‘+_:  (e e′:Regex) → Regex
∅ ‘+ e′ = e′
e‘ + ∅ = e 
e ‘+ e′ = e + e’

_‘•_ : (e e′:Regex) → Regex
∅ ‘• e′ = ∅
ε ‘• e′ = e′
e ‘• ∅ = ∅
e ‘• ε = e
e ‘• e′ = e • e’

_‘* : Regex → Regex
∅ ‘* = ε
ε ‘* = ε
e ‘* = e *
```

Derivadas de Brzozowski
===

- Algoritmo para obter a derivada da ER $e$ em relação à $a$, representado por $\partial_a(e)$

$$
\begin{equation*}
\begin{aligned}
\partial_a(\varnothing) &= \varnothing\\
\partial_a(\epsilon) &= \varnothing\\
\partial_a(b) &= \epsilon \text{ se } b \equiv a, \text{ senao } \varnothing\\
\partial_a(e \: e') &= \partial_a(e) \: e' + \nu(e) \: \partial_a(e')\\
\partial_a(e+e) &= \partial_a(e) + \partial_a(e')\\
\partial_a(e^*) &= \partial_a(e) \: e^*
\end{aligned}
\end{equation*}
$$

Agda
---
```haskell
∂[_,_] : Regex → Char → Regex
∂[ ∅ , c ] = ∅
∂[ ε , c ]  = ∅
∂[ $ c , c′ ] with c ?= c′
...| yes refl = ε
...| no prf = ∅
∂[ e • e′, c ] with ν[e]
...| yes pr = (∂[ e , c ] ‘• e′) ‘+ ∂[ e′ , c ]
...| no ¬pr = ∂[ e , c ] ‘• e′
∂[ e + e′, c ] = ∂[ e , c ] ‘+ ∂[ e′ , c ]
∂[ e* , c ] = ∂[ e , c ] ‘• (e ‘*)
```

Derivadas Parciais de Antimirov
===

- AFN ao invés de AFD: conjunto de ERs que aceitam as palavras
- $S \odot e$ concatena $e$ à direita de cada $e' \in S$

$$
\begin{equation*}
\begin{aligned}
\nabla_a(\varnothing) &= \varnothing\\
\nabla_a(\epsilon) &= \varnothing\\
\nabla_a(b) &= {\epsilon} \text{ se } b \equiv a, \text{ senao } \varnothing \\
\nabla_a(e\:e') &= \nabla_a(e) \odot e' \cup \nabla_a(e') \text{ se } \nu(e) \equiv \epsilon, \text{ senao } \nabla_a(e) \odot e'\\
\nabla_a(e+e') &= \nabla_a(e) \cup \nabla_a(e')\\
\nabla_a(e^*) &= \nabla(e) \odot e^*
\end{aligned}
\end{equation*}
$$

Agda
---

```haskell
∇[_,_] : Regex → Char → Regexes
∇[ ∅ , c ] = []
∇[ ε , c ]  = []
∇[ $ x , c ] with x ?= c
...| yes refl = [ ε ]
...| no p = []
∇[ e • e′ , c ] with ν[e]
...| yes p = (e′ ⊙ ∇[ e , c ]) ++ ∇[ e′ , c ]
...| no ¬p = e′ ⊙ ∇[ e , c ]
∇[ e + e′ , c ] = ∇[ e , c ] ++ ∇[ e′ , c ]
∇[ e* , c ] = (e*) ⊙ ∇[ e , c ]
```

Parsing
===

- Para determinar se $s \in e$ constrói-se uma extensão de derivadas

$$
\begin{equation*}
\begin{aligned}
\widehat{\partial}_\epsilon(e) &= e \\
\widehat{\partial}_{as}(e) &= \widehat{\partial}_s(\partial_a(e))
\end{aligned}
\end{equation*}
$$

Implementação
===

- Implementação no estilo da GNU grep

```bash
grep "ER" ./Regex.md 
- Um algoritmo para computar a derivada de uma ER
- Depende da função $\nu$ que verifica se a ER aceita $\epsilon$
- Um algoritmo para identificar ERs equivalentes a menos de $\epsilon$ e $\varnothing$
- Algoritmo para obter a derivada da ER $e$ em relação à $a$, representado por $\partial_a(e)$
- AFN ao invés de AFD: conjunto de ERs que aceitam as palavras
```

Implementação
===

- Construção de uma biblioteca de combinadores de parsing
- Uso da biblioteca padrão de Agda
  - Funções de Haskell

Experimentos
===

- Intel Core i7 1.7GHz, 8GB RAM, Mac OS X 10.12.3
- Comparação: GNU Grep, Google’s re2 e haskell‑regexp
- Arquivos contendo milhares de `a` usando a ER $(a + b + ab)^*$
  - arquivos contendo milhares de `ab`

Experimento 1
===

![](ex1.png)

Experimento 2
===

![](ex2.png)

Análise
===

- A ferramenta tem desempenho bem pior que ferramentas otimizadas
- Hipótese: a divisão das ERs em $\partial$
- Hipótese: uso de listas para representar $\nabla$

Conclusão
===

- Formalizamos completamente um algoritmo de parsing para ERs em Agda
  - 1145 linhas, 20 módulos, 39 lemas e teoremas
- Derivadas de Brzozowoski e Antimirov
- Trabalho futuro: guloso e POSIX para eficiência

Referências
===

- [Link com todas as referências](https://pastebin.com/50R2W5KM)