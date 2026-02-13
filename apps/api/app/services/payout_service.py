def is_payable(suspicious: bool, deduped: bool) -> bool:
    return (not suspicious) and (not deduped)
