function MaxymiserRepository() {
    this.SetPersCriterions = function () {
        var testUtil = new TestUtil();
        var visitorRepository = new VisitorRepository();
        var v = visitorRepository.PopulateVisitor();
        testUtil.overwriteVisitor(v);
        testUtil.debugJson(v);
        
        mmcore.SetPersCriterion("tier", v.tier.toString());
        mmcore.SetPersCriterion("hasInsider", v.hasInsiderSubscription.toString().toUpperCase());
        mmcore.SetPersCriterion("hasBoardroom", v.isBoardroomMember.toString().toUpperCase());
        mmcore.SetPersCriterion("creditCard", v.creditCard);
    };
}
