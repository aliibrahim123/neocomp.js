why neocomp?   
easy, since of these features.

# spec complient
notably the most important goal for neocomp, it is just regular javascript with simple 
spec complient additions on top of html for templating.   
it doesnt have magic or complex system under the hood, nor custom language or syntax that require transpiling, nor other features that are not javascripty.   
this make it very flexible and adaptable and easy to learn.

# simple in design
neocomp philosophy is to take simple and direct approches in implementation, it doesnt have
complex systems under the hood nor it has complex desing patterns, no VDOM or AOT code 
generation or any complex system.   
just components in simple objects with normal functions and state in object wrapping a real
DOM node, with simple and feature-diverse api.

# close to roots
neocomp doesnt abstract nor it hide the real DOM, but the opposite, it encouarage normal DOM 
interactions and provide full view to it.   
real DOM requires only slightly higher level interaction layer to make it friendler to work 
with, and neocomp provide many utilities to make dom easy.    
in additions, neocomp primitives are normal objects, not internal objects / abstract ideas,
making inspections and third party support super easy.

# lightweight
simplicity requires lightweighted foundation.   
since of neocomp simple design and direct DOM interaction nature, it is build on thin-like
but safe foundation.     
this had lead to neocomp to be measureable in sub 10 kb gzip, making it weight nothing
compared to other rival frameworks and contribute ones % from the bundle size.

# fast and performant
neocomp lightweight design and its direct DOM interaction nature had lead it to be very very
fast and performance.    
it doesnt rely on heavy technology like VDOM and declarative derivities that require non-free
systems to make it possible.    
thus, neocomp can achieve near native performace while being higher level that native, it is
just few function calls between state update and DOM update.   
the only optimizations needed is the micro ones, and you have full control on your DOM.

# flexible and adaptable
VDOM, AOT code generation and other fancy magic systems have many limitations making outside
connections very hard, and also having problems in async programmings.   
but because neocomp closeness to roots and direct DOM approch, it doesnt suffer from this
problems as it is just normal javascript like your code.   
also neocomp provides multiple features that simplify outside connections and make it safe.

# typesafe
neocomp is written in typescript and provide full type safety.    
type errors is the worst and most common bugs in javascript and by providing typesafy, we
can deliver safer and better developer experience.

# feature-diverse
neocomp provides many features as built in and provide many helpfull utilities.    
**mainly**: global state managment, lazy loading, zero refresh router, resource linking,
component bindings, DOM utils, and others.    
all of this while having the best features per size ratio.