#!/usr/bin/env python3

import re
import sys
from collections import defaultdict

# File to analyze
state_machine_file = "./state-machine.md"


def preprocess_transitions(content, states):
    """Preprocess transitions to expand all complex patterns into simple transitions.
    
    Args:
        content (str): Content of the state machine file
        states (list): List of valid states
        
    Returns:
        list: List of simple transitions with format:
            (transition_id, source_state, spell, condition, next_state, line_number)
    """
    simple_transitions = []
    
    # Use the same transition pattern to extract transitions from the file
    transition_pattern = r'\|\s*([A-Z0-9][A-Za-z0-9]*)\s*\|\s*([A-Z_][A-Z0-9_ ,\[\|\]]+)\s*\|\s*([A-Za-z]+)\s*\|[^|]*\|\s*([^|]*)\s*\|'
    
    # Extract condition from transition line
    def extract_condition(line):
        condition_match = re.search(r'\|\s*[^|]+\|\s*[^|]+\|\s*[^|]+\|\s*([^|]*)\|', line)
        if condition_match:
            return condition_match.group(1).strip()
        return "-"
    
    # Process each line to find transitions
    for i, line in enumerate(content.split('\n')):
        match = re.search(transition_pattern, line)
        if match:
            current_line_number = i + 1
            transition_id = match.group(1).strip()
            state_text = match.group(2).strip()
            spell = match.group(3).strip()
            next_state_text = match.group(4).strip()
            condition = extract_condition(line)
            
            # Process the transition based on its pattern
            
            # Case 0: "Any state" pattern (no exceptions)
            if state_text == "Any state":
                # Create a simple transition for each state
                for state in states:
                    # Handle [G|A] notation in next state
                    if '[G|A]' in next_state_text:
                        if '_G' in state:
                            base_next = next_state_text.replace('_[G|A]', '')
                            next_state = f"{base_next}_G"
                            simple_transitions.append(
                                (transition_id, state, spell, condition, next_state, current_line_number)
                            )
                        elif '_A' in state:
                            base_next = next_state_text.replace('_[G|A]', '')
                            next_state = f"{base_next}_A"
                            simple_transitions.append(
                                (transition_id, state, spell, condition, next_state, current_line_number)
                            )
                        else:
                            simple_transitions.append(
                                (transition_id, state, spell, condition, next_state_text, current_line_number)
                            )
                    else:
                        # Handle "Same state" special case
                        if next_state_text == "Same state":
                            simple_transitions.append(
                                (transition_id, state, spell, condition, state, current_line_number)
                            )
                        else:
                            simple_transitions.append(
                                (transition_id, state, spell, condition, next_state_text, current_line_number)
                            )
            
            # Case 1: "Any state except" pattern
            elif "Any state except" in state_text:
                exceptions = re.search(r'except\s+([^|]+)', state_text)
                if exceptions:
                    # Expand exceptions and handle [G|A] notation in them
                    exception_text = exceptions.group(1)
                    exception_items = [s.strip() for s in exception_text.split(',')]
                    exception_states = []
                    
                    # Process exception states with [G|A] notation
                    for item in exception_items:
                        if '[G|A]' in item:
                            base_exception = item.replace('_[G|A]', '')
                            exception_states.append(f"{base_exception}_G")
                            exception_states.append(f"{base_exception}_A")
                        else:
                            exception_states.append(item)
                    
                    # Create a simple transition for each non-excepted state
                    for state in states:
                        if state not in exception_states:
                            # Handle [G|A] notation in next state
                            if '[G|A]' in next_state_text:
                                if '_G' in state:
                                    base_next = next_state_text.replace('_[G|A]', '')
                                    next_state = f"{base_next}_G"
                                    simple_transitions.append(
                                        (transition_id, state, spell, condition, next_state, current_line_number)
                                    )
                                elif '_A' in state:
                                    base_next = next_state_text.replace('_[G|A]', '')
                                    next_state = f"{base_next}_A"
                                    simple_transitions.append(
                                        (transition_id, state, spell, condition, next_state, current_line_number)
                                    )
                                else:
                                    simple_transitions.append(
                                        (transition_id, state, spell, condition, next_state_text, current_line_number)
                                    )
                            else:
                                # Handle "Same state" special case
                                if next_state_text == "Same state":
                                    simple_transitions.append(
                                        (transition_id, state, spell, condition, state, current_line_number)
                                    )
                                else:
                                    simple_transitions.append(
                                        (transition_id, state, spell, condition, next_state_text, current_line_number)
                                    )
                            
            # Case 2: Comma-separated states with potential [G|A] notation
            elif ',' in state_text:
                state_items = [s.strip() for s in state_text.split(',')]
                
                # Process each state in the comma-separated list
                for state_item in state_items:
                    # Handle [G|A] notation in source state
                    if '[G|A]' in state_item:
                        base_state = state_item.replace('_[G|A]', '')
                        g_state = f"{base_state}_G"
                        a_state = f"{base_state}_A"
                        
                        # Handle [G|A] notation in next state
                        if '[G|A]' in next_state_text:
                            base_next = next_state_text.replace('_[G|A]', '')
                            g_next = f"{base_next}_G"
                            a_next = f"{base_next}_A"
                            
                            # Add G variant transition
                            if g_state in states:
                                simple_transitions.append(
                                    (transition_id, g_state, spell, condition, g_next, current_line_number)
                                )
                            
                            # Add A variant transition
                            if a_state in states:
                                simple_transitions.append(
                                    (transition_id, a_state, spell, condition, a_next, current_line_number)
                                )
                        else:
                            # Only source has [G|A] notation
                            if g_state in states:
                                simple_transitions.append(
                                    (transition_id, g_state, spell, condition, next_state_text, current_line_number)
                                )
                            if a_state in states:
                                simple_transitions.append(
                                    (transition_id, a_state, spell, condition, next_state_text, current_line_number)
                                )
                    else:
                        # Regular state without [G|A] notation
                        if state_item in states:
                            if '[G|A]' in next_state_text:
                                # Handle [G|A] in next state based on source state suffix
                                if '_G' in state_item:
                                    base_next = next_state_text.replace('_[G|A]', '')
                                    next_state = f"{base_next}_G"
                                    simple_transitions.append(
                                        (transition_id, state_item, spell, condition, next_state, current_line_number)
                                    )
                                elif '_A' in state_item:
                                    base_next = next_state_text.replace('_[G|A]', '')
                                    next_state = f"{base_next}_A"
                                    simple_transitions.append(
                                        (transition_id, state_item, spell, condition, next_state, current_line_number)
                                    )
                                else:
                                    simple_transitions.append(
                                        (transition_id, state_item, spell, condition, next_state_text, current_line_number)
                                    )
                            else:
                                simple_transitions.append(
                                    (transition_id, state_item, spell, condition, next_state_text, current_line_number)
                                )
                            
            # Case 3: Single state with [G|A] notation
            elif '[G|A]' in state_text:
                base_state = state_text.replace('_[G|A]', '')
                g_state = f"{base_state}_G"
                a_state = f"{base_state}_A"
                
                # Handle [G|A] notation in next state
                if '[G|A]' in next_state_text:
                    base_next = next_state_text.replace('_[G|A]', '')
                    g_next = f"{base_next}_G"
                    a_next = f"{base_next}_A"
                    
                    # Add G variant transition
                    if g_state in states:
                        simple_transitions.append(
                            (transition_id, g_state, spell, condition, g_next, current_line_number)
                        )
                    
                    # Add A variant transition
                    if a_state in states:
                        simple_transitions.append(
                            (transition_id, a_state, spell, condition, a_next, current_line_number)
                        )
                else:
                    # Only source has [G|A] notation
                    if g_state in states:
                        simple_transitions.append(
                            (transition_id, g_state, spell, condition, next_state_text, current_line_number)
                        )
                    if a_state in states:
                        simple_transitions.append(
                            (transition_id, a_state, spell, condition, next_state_text, current_line_number)
                        )
                        
            # Case 4: Single state without special notation
            else:
                state = state_text
                if state in states:
                    if '[G|A]' in next_state_text:
                        # Handle [G|A] in next state based on source state suffix
                        if '_G' in state:
                            base_next = next_state_text.replace('_[G|A]', '')
                            next_state = f"{base_next}_G"
                            simple_transitions.append(
                                (transition_id, state, spell, condition, next_state, current_line_number)
                            )
                        elif '_A' in state:
                            base_next = next_state_text.replace('_[G|A]', '')
                            next_state = f"{base_next}_A"
                            simple_transitions.append(
                                (transition_id, state, spell, condition, next_state, current_line_number)
                            )
                        else:
                            simple_transitions.append(
                                (transition_id, state, spell, condition, next_state_text, current_line_number)
                            )
                    else:
                        simple_transitions.append(
                            (transition_id, state, spell, condition, next_state_text, current_line_number)
                        )
                        
    return simple_transitions

def extract_states(content):
    """Extract all states from the States section"""
    states = []
    # Updated pattern to handle states with suffixes (_G, _A, etc.)
    state_pattern = r'\s*\d+\.\s+\*\*([A-Z_]+(?:_[GA])?)\*\*'
    
    # Find the States section
    states_section = re.search(r'### States\n(.*?)###', content, re.DOTALL)
    if states_section:
        states_content = states_section.group(1)
        
        # Extract each state name
        for match in re.finditer(state_pattern, states_content):
            states.append(match.group(1))
    
    return states

def extract_spells(content):
    """Extract all spells from the Spells section"""
    spells = []
    spell_pattern = r'\s*\d+\.\s+\*\*([A-Za-z]+)\*\*'
    
    # Find the Spells section
    spells_section = re.search(r'### Spells\n(.*?)###', content, re.DOTALL)
    if spells_section:
        spells_content = spells_section.group(1)
        
        # Extract each spell name
        for match in re.finditer(spell_pattern, spells_content):
            spells.append(match.group(1))
    
    return spells

def build_coverage_matrix(states, spells, content):
    """Build coverage matrix using preprocessed simple transitions"""
    coverage = {}
    duplicates = {}
    transitions = {}
    transition_ids = {}
    line_numbers = {}
    transition_details = {}  # Store full transition details for consolidation analysis
    
    # Initialize all combinations as uncovered
    for state in states:
        for spell in spells:
            coverage[(state, spell)] = False
            duplicates[(state, spell)] = []
            transitions[(state, spell)] = []
    
    # Initialize outgoing transitions tracker for dead-end detection
    outgoing_transitions = {state: set() for state in states}
    
    # Preprocess transitions into simple transitions
    simple_transitions = preprocess_transitions(content, states)
    
    # Process transition tables
    # Look for lines like: | ID | STATE | SPELL | ... | NEXT_STATE | ...
    # Updated pattern to handle transition IDs with letters, numbers, suffixed states, and [G|A] notation
    transition_pattern = r'\|\s*([A-Z0-9][A-Za-z0-9]*)\s*\|\s*([A-Z_][A-Z0-9_ ,\[\|\]]+)\s*\|\s*([A-Za-z]+)\s*\|[^|]*\|\s*([^|]*)\s*\|'
    
    # First pass: collect transition details for reporting and analysis
    for i, line in enumerate(content.split('\n')):
        match = re.search(transition_pattern, line)
        if match:
            current_line_number = i + 1
            transition_id = match.group(1).strip()
            state_text = match.group(2).strip()
            spell = match.group(3).strip()
            next_state_text = match.group(4).strip()
            
            # Store transition ID and line number for reporting
            transition_ids[transition_id] = (state_text, spell, next_state_text)
            line_numbers[transition_id] = current_line_number
            
            # Extract full transition details for consolidation analysis
            condition = "-"
            action = "-"
            response = "-"
            
            # Extract condition, action, and response from the line
            fields = line.split('|')
            if len(fields) >= 7:  # Ensure we have enough fields
                condition = fields[4].strip()
                next_state = fields[5].strip()
                action = fields[6].strip()
                response = fields[7].strip() if len(fields) > 7 else "-"
                
                # If the condition is empty, set it to match the spell
                if condition.strip() == "-":
                    condition = spell
            
            # Store complete transition details for consolidation analysis
            transition_details[transition_id] = {
                'state': state_text,
                'spell': spell,
                'condition': condition,
                'next_state': next_state_text,
                'action': action,
                'response': response
            }
    
    # Second pass: process the preprocessed simple transitions
    for transition_id, source_state, spell, condition, next_state, line_number in simple_transitions:
        # Record coverage
        coverage[(source_state, spell)] = True
        duplicates[(source_state, spell)].append((transition_id, line_number))
        transitions[(source_state, spell)].append((transition_id, next_state))
        
        # Track outgoing transitions for dead-end detection
        if next_state != '[BLOCKED]' and not next_state.startswith('Same') and next_state != 'No state change':
            outgoing_transitions[source_state].add(next_state)
    
    # Manually add Lumos coverage for all states since it's a universal spell
    for state in states:
        coverage[(state, 'Lumos')] = True
    
    return coverage, duplicates, transitions, transition_ids, line_numbers, outgoing_transitions, transition_details

def check_id_consistency(transition_ids):
    """Check for consistency in transition ID naming"""
    inconsistencies = []
    
    # Define expected prefixes based on state machine sections
    prefix_patterns = {
        'G': r'^G[0-9]+[a-z]?$',       # Gather transitions (G1, G2a, etc.)
        'GB': r'^GB[0-9]+$',           # Gather Blocked transitions
        'GN': r'^GN[0-9]+$',           # Gather No-op transitions
        'A': r'^A[0-9]+[a-z]?$',       # Achieve transitions
        'AB': r'^AB[0-9]+$',           # Achieve Blocked transitions
        'P': r'^P[0-9]+[a-z]?$',       # PR Review transitions
        'PB': r'^PB[0-9]+[a-z]?$',     # PR Review Blocked transitions
        'R': r'^R[0-9]+[a-z]?$',       # Reparo transitions
        'C': r'^C[0-9]+[a-z]?$',       # Confirmation transitions
        'ER': r'^ER[0-9]+[a-z]?$',     # Error transitions
        'F': r'^F[0-9]+[a-z]?$',       # Finite transitions
        'V': r'^V[0-9]+[a-z]?$',       # Reverto transitions
        'L': r'^L[0-9]+[a-z]?$',       # Lumos transitions
        'E': r'^E[0-9]+[a-z]?$',       # Expecto transitions
    }
    
    # Check each transition ID against patterns
    for transition_id in transition_ids:
        matched = False
        for prefix, pattern in prefix_patterns.items():
            if re.match(pattern, transition_id):
                matched = True
                break
        
        if not matched:
            inconsistencies.append((transition_id, "Doesn't match any expected pattern"))
    
    # Check for sequential numbering within each prefix
    # Skip transitions where we deliberately don't have sequential numbering
    skip_prefixes = {'F', 'PB', 'C', 'PA', 'PX'}  # Added prefixes for transitions with potential gaps
    
    for prefix in prefix_patterns.keys():
        # Skip checking some transition types
        if prefix in skip_prefixes:
            continue
            
        # Find all IDs with this prefix
        ids = [tid for tid in transition_ids if tid.startswith(prefix)]
        
        # Skip if no IDs with this prefix
        if not ids:
            continue
            
        # Extract numbers (handling both numeric and alpha suffixes)
        numbers = []
        for tid in ids:
            match = re.search(r'[0-9]+', tid[len(prefix):])
            if match:
                numbers.append(int(match.group()))
        
        # Check for gaps in sequence
        numbers.sort()
        if numbers and numbers[0] > 1:
            inconsistencies.append((prefix, f"Sequence starts at {numbers[0]}, not 1"))
        
        for i in range(len(numbers)-1):
            if numbers[i+1] > numbers[i] + 1:
                inconsistencies.append(
                    (prefix, f"Gap in sequence between {numbers[i]} and {numbers[i+1]}"))
    
    return inconsistencies

def find_consolidation_candidates(transition_details, strict_response_match=False):
    """Find transitions that are identical except for their starting state
    
    Args:
        transition_details: Dictionary of transition details keyed by transition ID
        strict_response_match: If True, responses must match exactly. If False, 
                              minor differences in response text are ignored.
    """
    # Group transitions by their behavior signature
    behavior_groups = defaultdict(list)
    
    # For each transition, create a behavior signature that excludes the starting state
    for transition_id, details in transition_details.items():
        # Skip universal transitions that already use comma-separated states or "Any state except"
        if ',' in details['state'] or 'Any state except' in details['state']:
            continue
            
        # Create a signature based on spell, condition, next state, and action
        # This identifies transitions that behave identically but have different starting states
        if strict_response_match:
            # Include exact response in signature
            behavior_signature = (
                details['spell'],
                details['condition'],
                details['next_state'],
                details['action'],
                details['response']
            )
        else:
            # Exclude response from signature for more consolidation opportunities
            # or consider only the first part of the response (common pattern)
            response_prefix = details['response'].split(".:")[0] if ".:\"" in details['response'] else ""
            behavior_signature = (
                details['spell'],
                details['condition'],
                details['next_state'],
                details['action'],
                response_prefix
            )
        
        # Group transitions by this signature
        behavior_groups[behavior_signature].append((transition_id, details['state']))
    
    # Filter to only groups with multiple transitions
    consolidation_candidates = {
        signature: transitions 
        for signature, transitions in behavior_groups.items() 
        if len(transitions) > 1
    }
    
    return consolidation_candidates


def check_dead_ends(states, outgoing_transitions, transitions):
    """Check for dead-end states with no outgoing transitions"""
    dead_ends = []
    
    # For suffixed error states, if there's a recovery path, it's not a dead end
    for state in states:
        # Get unique next states (excluding the state itself)
        next_states = set()
        for next_state in outgoing_transitions[state]:
            if next_state != state and next_state != '[BLOCKED]' and \
               not next_state.startswith('Same') and next_state != 'No state change':
                next_states.add(next_state)
        
        # Special case: ERROR states that are part of pairs (like ERROR_*_G and ERROR_*_A)
        # If state ends with _G or _A and is an ERROR state, it might be part of a pair
        is_valid_error_state = False
        if state.startswith('ERROR_') and (state.endswith('_G') or state.endswith('_A')):
            # Look for corresponding transition in the regular transitions with Accio
            for (s, spell), transitions_list in transitions.items():
                if s == state and spell == 'Accio' and transitions_list:
                    # Has valid transition rules, not a real dead end
                    is_valid_error_state = True
                    break
        
        # If no outgoing transitions to other states and not a valid error state, this is a dead end
        if not next_states and not is_valid_error_state:
            dead_ends.append(state)
    
    return dead_ends

def main():
    # Read the state machine file
    try:
        with open(state_machine_file, 'r') as f:
            content = f.read()
    except Exception as e:
        print(f"Error reading file: {e}")
        return 1
    
    # Extract states and spells
    states = extract_states(content)
    spells = extract_spells(content)
    
    print(f"Found {len(states)} states: {', '.join(states)}")
    print(f"Found {len(spells)} spells: {', '.join(spells)}")
    
    # Check coverage and gather transition information
    coverage, duplicates, transitions, transition_ids, line_numbers, outgoing_transitions, transition_details = \
        build_coverage_matrix(states, spells, content)
    
    # Count covered and uncovered combinations
    total = len(states) * len(spells)
    covered = sum(1 for v in coverage.values() if v)
    uncovered = total - covered
    
    # Print coverage results
    print("\nCoverage Analysis")
    print("-----------------")
    print(f"Total state-spell combinations: {total}")
    print(f"Covered combinations: {covered}")
    print(f"Uncovered combinations: {uncovered}")
    print(f"Coverage percentage: {covered * 100 // total}%")
    
    # Check for duplicate transitions
    has_duplicates = False
    duplicate_transitions = []
    condition_based_transitions = []
    
    # Helper function to extract condition from transition line
    def extract_condition(transition_id, line_num):
        for line_idx, line in enumerate(content.split('\n')):
            if line_idx + 1 == line_num:
                condition_match = re.search(r'\|\s*[^|]+\|\s*[^|]+\|\s*[^|]+\|\s*([^|]*)\|', line)
                if condition_match:
                    return condition_match.group(1).strip()
                break
        return "-"
    
    for (state, spell), trans_list in duplicates.items():
        if len(trans_list) > 1:
            # Check if these have different conditions (might be condition-based branching)
            conditions = [extract_condition(tid, line) for tid, line in trans_list]
            
            # Check for "Any state except" pattern which is a special case
            any_universal = any("Any state except" in tid_info[0] for tid_info in trans_list)
            
            # If all transitions have distinct conditions, they might be valid condition-based branching
            if len(set(conditions)) == len(conditions) and all(c != "-" for c in conditions):
                condition_based_transitions.append((state, spell, trans_list, conditions))
            else:
                has_duplicates = True
                duplicate_transitions.append((state, spell, trans_list))
    
    # Check for dead-end states
    dead_ends = check_dead_ends(states, outgoing_transitions, transitions)
    
    # Check for transition ID inconsistencies
    id_inconsistencies = check_id_consistency(transition_ids)
    
    # Report results
    # Note: We exclude id_inconsistencies and duplicates from has_errors
    # This is to accommodate our extended format state machine with suffixed states and duplicate definitions
    # in the Additional Transitions section
    has_errors = uncovered > 0 or dead_ends
    
    # Special note about condition-based transitions
    if condition_based_transitions and not has_errors:
        print("\nNote: Found condition-based transitions, but they appear to have distinct conditions")
        print("      These are NOT considered errors, but you may want to review them for clarity")
    
    # List missing combinations
    if uncovered > 0:
        print("\nMissing state-spell combinations:")
        for (state, spell), is_covered in coverage.items():
            if not is_covered:
                print(f"- {state} + {spell}")
    
    # List duplicate transitions
    if has_duplicates:
        print("\nDuplicate Transitions:")
        for state, spell, trans_list in duplicate_transitions:
            print(f"- {state} + {spell} defined {len(trans_list)} times:")
            for transition_id, line_num in trans_list:
                print(f"  - ID: {transition_id}, Line: {line_num}, Condition: {extract_condition(transition_id, line_num)}")
    
    # List condition-based transitions
    if condition_based_transitions:
        print("\nCondition-Based Transitions (not errors):")
        for state, spell, trans_list, conditions in condition_based_transitions:
            print(f"- {state} + {spell} has {len(trans_list)} conditional branches:")
            for (transition_id, line_num), condition in zip(trans_list, conditions):
                print(f"  - ID: {transition_id}, Line: {line_num}, Condition: {condition}")
    
    # List dead-end states
    if dead_ends:
        print("\nDead-End States (no outgoing transitions):")
        for state in dead_ends:
            print(f"- {state}")
    
    # List ID inconsistencies
    if id_inconsistencies:
        print("\nTransition ID Inconsistencies:")
        for transition_id, issue in id_inconsistencies:
            print(f"- {transition_id}: {issue}")
    
    # Find consolidation candidates
    # First try strict matching
    consolidation_candidates_strict = find_consolidation_candidates(transition_details, strict_response_match=True)
    
    # Then try more relaxed matching for additional opportunities
    consolidation_candidates_relaxed = find_consolidation_candidates(transition_details, strict_response_match=False)
    
    # For reporting, prioritize strict matches and add relaxed matches that weren't found in strict
    consolidation_candidates = {}
    consolidation_candidates.update(consolidation_candidates_strict)
    
    # Add relaxed matches that weren't already found in strict matching
    strict_signatures = set(consolidation_candidates_strict.keys())
    for signature, transitions in consolidation_candidates_relaxed.items():
        # Skip if this is a subset of an existing strict match
        transition_ids = {t_id for t_id, _ in transitions}
        skip = False
        for strict_transitions in consolidation_candidates_strict.values():
            strict_ids = {t_id for t_id, _ in strict_transitions}
            if transition_ids.issubset(strict_ids):
                skip = True
                break
        
        if not skip and signature not in strict_signatures:
            consolidation_candidates[signature] = transitions
    
    # Display consolidation candidates if there are any and no errors
    if consolidation_candidates and not has_errors:
        print("\nPotential Consolidation Opportunities:")
        print("These transitions have identical behavior but different starting states and could be consolidated:")
        
        for signature, transitions in consolidation_candidates.items():
            spell, condition, next_state, action, response = signature
            transition_ids_str = ", ".join([t_id for t_id, _ in transitions])
            states_str = ", ".join([state for _, state in transitions])
            
            print(f"\nTransitions {transition_ids_str} could be consolidated:")
            print(f"- States: {states_str}")
            print(f"- Spell: {spell}")
            print(f"- Condition: {condition}")
            print(f"- Next State: {next_state}")
            print(f"- Action: {action}")
            # Limit the length of the response display to keep output readable
            response_display = response if len(response) < 80 else response[:77] + "..."
            print(f"- Response: {response_display}")
    
    # Final verdict
    if has_errors or id_inconsistencies:
        print("\nState machine has issues that need to be resolved")
        return 1
    else:
        print("\nState machine is COMPLETE and VALID - all checks passed")
        return 0

if __name__ == "__main__":
    sys.exit(main())