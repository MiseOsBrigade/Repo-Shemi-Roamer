from linkforge_research.engine import deduplicate,synthesize
from linkforge_research.models import Evidence

def test_deduplicate_and_score():
    a=Evidence("A useful paper","https://a","openalex",doi="10.1/a",authority=.9)
    b=Evidence("A useful paper","https://b","crossref",doi="10.1/a",authority=.8)
    result=deduplicate([a,b])
    assert len(result)==1
    assert result[0].corroboration>0
    assert synthesize(result)["evidence_count"]==1
