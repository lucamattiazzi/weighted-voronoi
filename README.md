# Weighted Voronoi

## What

Builds a Voronoi tesselation where the surface of each cell will tend towards a specific weight (higher weight => biggest cell). If the weight changes (or a new cell is added) the tesselation adapts to it.

## How

With an error function, a minimization algorithm (nelder mead currently, but that will be changed), a webworker that computes the new positions and a lot of code that shouldn't ever be written.

## Why

Because I thought it could be cool (it isn't though).
