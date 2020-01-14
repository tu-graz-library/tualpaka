/**
 * Copyright (C) 2020 Christoph Ladurner, Technische Universität Graz, Bibliothek
 *
 * To print the labels in Alma the user has search with "Physische
 * Exemplare". Then every physical items occur in the result list. The
 * Print Label button is then on the right side on every result item
 * hidden behind the three points.
 *
 * This extension only works with the German language package in Alma.
 *
 * init file to create the array of handle functions for the mutation
 * observer which observes the #loadingBlockerStatusIdentifier element
 *
 **/

window.loadingBlockerEvents = [];
